package nyan.meow.dumbleDoorMinecraft;

import com.google.gson.JsonObject;

public class ActionData {
    private String block;
    private BlockCoordinates position;

    public ActionData(String block, BlockCoordinates position) {
        this.block = block;
        this.position = position;
    }

    public String getBlock() {
        return block;
    }

    public BlockCoordinates getPosition() {
        return position;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public void setPosition(BlockCoordinates position) {
        this.position = position;
    }

    public static ActionData fromJson(JsonObject dataJson) {
        String block = dataJson.get("block").getAsString();
        BlockCoordinates position = BlockCoordinates.fromJson(dataJson.getAsJsonObject("position"));
        return new ActionData(block, position);
    }

    @Override
    public String toString() {
        return "Block: " + block + ", Position: " + position;
    }
}