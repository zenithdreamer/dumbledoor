package nyan.meow.dumbleDoorMinecraft;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.bukkit.plugin.Plugin;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class PluginConfig {

    private final Plugin plugin;
    private final File jsonFile;
    private final Gson gson;

    private String userServiceUrl;
    private String accessServiceUrl;
    private String doorServiceUrl;
    private String logServiceUrl;
    private String cardServiceUrl;
    private String buttonServiceUrl;
    private String alarmServiceUrl;

    private String mqttBrokerUrl;

    private String apiSecret;

    private List<Door> doors;
    private List<Alarm> alarms;

    public PluginConfig(Plugin plugin) {
        this.plugin = plugin;
        this.gson = new GsonBuilder().setPrettyPrinting().create();
        this.jsonFile = new File(plugin.getDataFolder(), "config.json");
    }

    // Initialize the config: create if it doesn't exist, or load it
    public void init() {
        if (!jsonFile.exists()) {
            plugin.getLogger().info("Config file does not exist. Copying default from resources.");
            copyDefaultConfig();
        } else {
            readJsonFile();
        }
    }

    // Copy default config from resources if config file doesn't exist
    private void copyDefaultConfig() {
        if (!plugin.getDataFolder().exists()) {
            plugin.getDataFolder().mkdirs();
        }

        plugin.saveResource("config.json", false);
        plugin.getLogger().info("Default config copied from resources.");
        readJsonFile();

    }

    // Read data from the JSON file
    private void readJsonFile() {
        try {
            FileReader reader = new FileReader(jsonFile);
            JsonObject jsonObject = gson.fromJson(reader, JsonObject.class);
            reader.close();

            this.userServiceUrl = jsonObject.get("USER_SERVICE_URL").getAsString();
            this.accessServiceUrl = jsonObject.get("ACCESS_SERVICE_URL").getAsString();
            this.doorServiceUrl = jsonObject.get("DOOR_SERVICE_URL").getAsString();
            this.logServiceUrl = jsonObject.get("LOG_SERVICE_URL").getAsString();
            this.cardServiceUrl = jsonObject.get("CARD_SERVICE_URL").getAsString();
            this.buttonServiceUrl = jsonObject.get("BUTTON_SERVICE_URL").getAsString();
            this.alarmServiceUrl = jsonObject.get("ALARM_SERVICE_URL").getAsString();

            this.mqttBrokerUrl = jsonObject.get("MQTT_BROKER_URL").getAsString();
            this.apiSecret = jsonObject.get("API_SECRET").getAsString();

            // Parse doors
            JsonArray doorsArray = jsonObject.getAsJsonArray("doors");
            this.doors = new ArrayList<>();
            for (var doorJson : doorsArray) {
                this.doors.add(Door.fromJson(doorJson.getAsJsonObject()));
            }

            // Parse alarms
            JsonArray alarmsArray = jsonObject.getAsJsonArray("alarms");
            this.alarms = new ArrayList<>();
            for (var alarmJson : alarmsArray) {
                this.alarms.add(Alarm.fromJson(alarmJson.getAsJsonObject()));
            }


        } catch (IOException e) {
            plugin.getLogger().severe("Failed to read JSON file: " + e.getMessage());
        }
    }

//    public void save(JsonObject jsonObject) {
//        try {
//            FileWriter writer = new FileWriter(jsonFile);
//            gson.toJson(jsonObject, writer);
//            writer.flush();
//            writer.close();
//            plugin.getLogger().info("JSON file saved.");
//        } catch (IOException e) {
//            plugin.getLogger().severe("Failed to save JSON file: " + e.getMessage());
//        }
//    }

    public String getUserServiceUrl() {
        return userServiceUrl;
    }

    public String getAccessServiceUrl() {
        return accessServiceUrl;
    }

    public String getDoorServiceUrl() {
        return doorServiceUrl;
    }

    public String getLogServiceUrl() {
        return logServiceUrl;
    }

    public String getCardServiceUrl() {
        return cardServiceUrl;
    }

    public String getButtonServiceUrl() {
        return buttonServiceUrl;
    }

    public String getAlarmServiceUrl() {
        return alarmServiceUrl;
    }

    public String getMqttBrokerUrl() {
        return mqttBrokerUrl;
    }

    public String getApiSecret() {
        return apiSecret;
    }

    public List<Door> getDoors() {
        return doors;
    }

    public List<Alarm> getAlarms() {
        return alarms;
    }

}