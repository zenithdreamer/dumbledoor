package nyan.meow.dumbleDoorMinecraft;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.block.Block;
import org.bukkit.block.BlockState;
import org.bukkit.block.Sign;
import org.bukkit.entity.Player;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Door {
    private BlockCoordinates existSwitch;
    private String id;
    private int openTime;
    private List<DoorAction> openAction;
    private List<DoorAction> closeAction;
    private BlockCoordinates readerBlock;
    private BlockCoordinates signBlock;
    private String name;
    private int accessLevel;

    public Door(String id, int openTime, List<DoorAction> openAction, List<DoorAction> closeAction, BlockCoordinates readerBlock, BlockCoordinates signBlock, BlockCoordinates exitSwitch) {
        this.id = id;
        this.openTime = openTime;
        this.openAction = openAction;
        this.closeAction = closeAction;
        this.readerBlock = readerBlock;
        this.signBlock = signBlock;
        this.existSwitch = exitSwitch;

        // Set door id on sign
        if (signBlock != null) {
            updateSignText(new String[]{"", "Loading...", "", ""});
        }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public int getOpenTime() {
        return openTime;
    }

    public List<DoorAction> getOpenAction() {
        return openAction;
    }

    public BlockCoordinates getReaderBlock() {
        return readerBlock;
    }

    public BlockCoordinates getSignBlock() {
        return signBlock;
    }

    public BlockCoordinates getExitSwitch() { return existSwitch; }

    public void setId(String id) {
        this.id = id;
    }

    public void setOpenTime(int openTime) {
        this.openTime = openTime;
    }

    public void setOpenAction(List<DoorAction> openAction) {
        this.openAction = openAction;
    }

    public void setReaderBlock(BlockCoordinates readerBlock) {
        this.readerBlock = readerBlock;
    }

    public void setSignBlock(BlockCoordinates signBlock) {
        this.signBlock = signBlock;
    }

    public void setExitSwitch(BlockCoordinates exitSwitch) { this.existSwitch = exitSwitch; }

    // Display door status
    public void displayStatus() {
        System.out.println("Door ID: " + id);
        System.out.println("Open Time: " + openTime + "ms");
        System.out.println("Open Actions: " + openAction);
        if (signBlock != null) {
            System.out.println("Sign Block Coordinates: " + signBlock);
        }
    }

    public void unlock(Player player) {
        for (DoorAction doorAction : openAction) {
            String actionType = doorAction.getAction();
            ActionData actionData = doorAction.getData();

            if (actionType.equals("PLACE_BLOCK")) {
                BlockCoordinates position = actionData.getPosition();
                Block block = position.toLocation().getBlock();
                block.setType(Objects.requireNonNull(Material.getMaterial(actionData.getBlock().toUpperCase())));
            }
        }

        player.sendMessage("Door id " + id + " unlocked!");
    }

    public void lock(Player player) {
        for (DoorAction doorAction : closeAction) {
            String actionType = doorAction.getAction();
            ActionData actionData = doorAction.getData();

            if (actionType.equals("PLACE_BLOCK")) {
                BlockCoordinates position = actionData.getPosition();
                Block block = position.toLocation().getBlock();
                block.setType(Objects.requireNonNull(Material.getMaterial(actionData.getBlock().toUpperCase())));
            }
        }

        player.sendMessage("Door id " + id + " locked!");
    }

    public void updateSignText(String[] lines) {
        if (signBlock == null) {
            return;
        }

        Block block = signBlock.toLocation().getBlock();
        BlockState state = block.getState();

        if (state instanceof Sign sign) {
            for (int i = 0; i < lines.length && i < 4; i++) {
                sign.setLine(i, ChatColor.translateAlternateColorCodes('&', lines[i]));
            }
            sign.update(); // Update the sign to reflect the changes
        }

    }


    public static Door fromJson(JsonObject doorJson) {
        String id = doorJson.get("id").getAsString();
        int openTime = doorJson.get("openTime").getAsInt();

        // Parse open actions
        List<DoorAction> openActions = new ArrayList<>();
        JsonArray openActionArray = doorJson.getAsJsonArray("openAction");
        for (var actionJson : openActionArray) {
            openActions.add(DoorAction.fromJson(actionJson.getAsJsonObject()));
        }

        // Parse close actions
        List<DoorAction> closeActions = new ArrayList<>();
        JsonArray closeActionArray = doorJson.getAsJsonArray("closeAction");
        for (var actionJson : closeActionArray) {
            closeActions.add(DoorAction.fromJson(actionJson.getAsJsonObject()));
        }

        // Parse reader block
        BlockCoordinates readerBlock = BlockCoordinates.fromJson(doorJson.getAsJsonObject("readerBlock"));

        // Parse optional sign block
        BlockCoordinates signBlock = null;
        if (doorJson.has("signBlock")) {
            signBlock = BlockCoordinates.fromJson(doorJson.getAsJsonObject("signBlock"));
        }

        BlockCoordinates exitswitch = null;
        if (doorJson.has("exitSwitch")) {
            exitswitch = BlockCoordinates.fromJson(doorJson.getAsJsonObject("exitSwitch"));
        }

        return new Door(id, openTime, openActions, closeActions, readerBlock, signBlock, exitswitch);
    }

    public String getName() {
        return name;
    }

    public int getAccessLevel() {
        return accessLevel;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setAccessLevel(int accessLevel) {
        this.accessLevel = accessLevel;
    }
}

class DoorAction {
    private String action;
    private ActionData data;

    public DoorAction(String action, ActionData data) {
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

    public static DoorAction fromJson(JsonObject actionJson) {
        String action = actionJson.get("action").getAsString();
        ActionData data = ActionData.fromJson(actionJson.getAsJsonObject("data"));
        return new DoorAction(action, data);
    }

    @Override
    public String toString() {
        return "Action: " + action + ", Data: " + data;
    }
}