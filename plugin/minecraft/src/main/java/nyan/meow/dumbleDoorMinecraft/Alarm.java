package nyan.meow.dumbleDoorMinecraft;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.bukkit.Material;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Alarm {
    private String id;
    private List<AlarmAction> triggerAction;
    private List<AlarmAction> resetAction;
    private String name;

    public Alarm(String id, List<AlarmAction> triggerAction, List<AlarmAction> resetAction) {
        this.id = id;
        this.triggerAction = triggerAction;
        this.resetAction = resetAction;
    }

    public static Alarm fromJson(JsonObject alarmJson) {
        String id = alarmJson.get("id").getAsString();

        // Parse trigger actions
        List<AlarmAction> triggerAction = new ArrayList<>();
        JsonArray triggerActionArray = alarmJson.getAsJsonArray("triggerAction");
        for (var actionJson : triggerActionArray) {
            triggerAction.add(AlarmAction.fromJson(actionJson.getAsJsonObject()));
        }

        // Parse reset actions
        List<AlarmAction> resetAction = new ArrayList<>();
        JsonArray resetActionArray = alarmJson.getAsJsonArray( "resetAction");
        for (var actionJson : resetActionArray) {
            resetAction.add(AlarmAction.fromJson(actionJson.getAsJsonObject()));
        }


        return new Alarm(id, triggerAction, resetAction);
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void trigger() {
        for (AlarmAction action : triggerAction) {
            String actionType = action.getAction();
            ActionData actionData = action.getData();

            if (actionType.equals("PLACE_BLOCK")) {
                BlockCoordinates position = actionData.getPosition();
                Block block = position.toLocation().getBlock();
                Material material = Material.getMaterial(actionData.getBlock().toUpperCase());
                block.setType(material);
            }
        }

    }

    public void reset() {
        for (AlarmAction action : resetAction) {
            String actionType = action.getAction();
            ActionData actionData = action.getData();

            if (actionType.equals("PLACE_BLOCK")) {
                BlockCoordinates position = actionData.getPosition();
                Block block = position.toLocation().getBlock();
                block.setType(Objects.requireNonNull(Material.getMaterial(actionData.getBlock().toUpperCase())));
            }
        }

    }
}

class AlarmAction {
    private String action;
    private ActionData data;

    public AlarmAction(String action, ActionData data) {
        this.action = action;
        this.data = data;
    }

    public String getAction() {
        return action;
    }

    public ActionData getData() {
        return data;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public void setData(ActionData data) {
        this.data = data;
    }

    public static AlarmAction fromJson(JsonObject actionJson) {
        String action = actionJson.get("action").getAsString();
        ActionData data = ActionData.fromJson(actionJson.getAsJsonObject("data"));
        return new AlarmAction(action, data);
    }

    @Override
    public String toString() {
        return "Action: " + action + ", Data: " + data;
    }
}