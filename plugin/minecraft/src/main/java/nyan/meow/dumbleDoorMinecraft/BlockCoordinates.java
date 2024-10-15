package nyan.meow.dumbleDoorMinecraft;


import com.google.gson.JsonObject;
import org.bukkit.Bukkit;
import org.bukkit.Location;

public class BlockCoordinates {
    private int x;
    private int y;
    private int z;

    public BlockCoordinates(int x, int y, int z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public int getZ() {
        return z;
    }

    public void setX(int x) {
        this.x = x;
    }

    public void setY(int y) {
        this.y = y;
    }

    public void setZ(int z) {
        this.z = z;
    }

    public static BlockCoordinates fromJson(JsonObject blockJson) {
        int x = blockJson.get("x").getAsInt();
        int y = blockJson.get("y").getAsInt();
        int z = blockJson.get("z").getAsInt();
        return new BlockCoordinates(x, y, z);
    }

    public Location toLocation() {
        return new Location(Bukkit.getWorld("world"), x, y, z);
    }

    @Override
    public String toString() {
        return "Coordinates(" + x + ", " + y + ", " + z + ")";
    }
}