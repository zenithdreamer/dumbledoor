package nyan.meow.dumbleDoorMinecraft;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import nyan.meow.dumbleDoorMinecraft.utils.HttpUtil;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.Listener;
import org.eclipse.paho.client.mqttv3.MqttException;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;

public class AlarmManager implements Listener {
    private Main plugin;
    private List<Alarm> alarms;

    public AlarmManager(Main plugin) {
        this.alarms = new ArrayList<>();
        this.plugin = plugin;
        initializeAlarms();
        fetchAlarmsFromApi();
        subscribeToAlarmTopic();
    }

    private void subscribeToAlarmTopic() {
        // Loop all alarms and subscribe to the topic
        for (Alarm alarm : alarms) {
            try {
                plugin.getMqttClient().subscribe("dumbledoor-alarm/" + alarm.getId(), (topic, message) -> {
                    System.out.println("Received alarm mqtt message: " + alarm.getId() + " - '" + message+ "'");

                    boolean status = message.toString().equalsIgnoreCase("true");

                    if(status)
                        triggerAlarm(alarm.getId());
                    else
                        resetAlarm(alarm.getId());
                });
            } catch (MqttException e) {
                e.printStackTrace();
            }
        }
    }

    public void addAlarm(Alarm alarm) {
        alarms.add(alarm);
    }

    public List<Alarm> getAlarms() {
        return alarms;
    }

    public void initializeAlarms() {
        PluginConfig config = plugin.getPluginConfig();
        for (Alarm alarm : config.getAlarms()) {
            alarms.add(alarm);
            System.out.println("Alarm initialized: " + alarm.getId());
        }
    }

    private void fetchAlarmsFromApi() {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                HttpUtil httpUtil = new HttpUtil(plugin);
                String response = httpUtil.fetchData(this.plugin.getPluginConfig().getAlarmServiceUrl() + "/api/internal/alarms");
                JsonArray alarmArray = JsonParser.parseString(response).getAsJsonArray();

                for (var alarmJson : alarmArray) {
                    JsonObject doorObj = alarmJson.getAsJsonObject();
                    String id = doorObj.get("id").getAsString();
                    String name = doorObj.get("name").getAsString();

                    Alarm alarm = alarms.stream().filter(a -> a.getId().equals(id)).findFirst().orElse(null);
                    if (alarm != null) {
                        alarm.setName(name);
                        System.out.println("Updated alarm: " + alarm.getId());
                    }
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public void triggerAlarm(String alarmId) {
        Alarm alarm = alarms.stream().filter(a -> a.getId().equals(alarmId)).findFirst().orElse(null);
        if (alarm == null) {
            this.plugin.getLogger().log(Level.SEVERE, "Alarm not found with id: " + alarmId);
           //player.sendMessage("Alarm not found with id: " + alarmId);
           return;
        }

        this.plugin.getLogger().log(Level.INFO, "Alarm triggered: " + alarmId);

        Bukkit.getScheduler().runTask(plugin, () -> {
            alarm.trigger();
        });
    }

    public void resetAlarm(String alarmId) {
        Alarm alarm = alarms.stream().filter(a -> a.getId().equals(alarmId)).findFirst().orElse(null);
        if (alarm == null) {
            this.plugin.getLogger().log(Level.SEVERE, "Alarm not found with id: " + alarmId);
            //player.sendMessage("Alarm not found with id: " + alarmId);
            return;
        }

        this.plugin.getLogger().log(Level.INFO, "Alarm reset: " + alarmId);

        Bukkit.getScheduler().runTask(plugin, () -> {
            alarm.reset();
        });
    }
}
