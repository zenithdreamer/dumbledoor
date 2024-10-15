package nyan.meow.dumbleDoorMinecraft;

import nyan.meow.dumbleDoorMinecraft.listeners.ChestListener;
import org.bukkit.plugin.java.JavaPlugin;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.jetbrains.annotations.NotNull;

public final class Main extends JavaPlugin {

    private PluginConfig pluginConfig;
    private DoorManager doorManager;
    private AlarmManager alarmManager;
    private MqttClient mqttClient;

    @Override
    public void onEnable() {
        this.pluginConfig = new PluginConfig(this);
        this.pluginConfig.init();

        getServer().getPluginManager().registerEvents(new ChestListener(this), this);
        getLogger().info("DumbleDoor has been enabled!");


        MqttClient client = null;
        try {
            mqttClient = new MqttClient(this.pluginConfig.getMqttBrokerUrl(), "DumbleDoorMinecraft");
            MqttConnectOptions options = new MqttConnectOptions();
            mqttClient.connect(options);
            getLogger().info("Connected to MQTT broker: " + this.pluginConfig.getMqttBrokerUrl());
        } catch (MqttException e) {
            throw new RuntimeException(e);
        }

        this.doorManager = new DoorManager(this);
        this.alarmManager = new AlarmManager(this);

        getServer().getPluginManager().registerEvents(this.doorManager, this);
        getServer().getPluginManager().registerEvents(this.alarmManager, this);
    }

    @Override
    public void onDisable() {
    }

    @NotNull
    public PluginConfig getPluginConfig() {
        return pluginConfig;
    }

    @NotNull
    public DoorManager getDoorManager() {
        return doorManager;
    }

    @NotNull
    public MqttClient getMqttClient() {
        return mqttClient;
    }
}
