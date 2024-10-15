package nyan.meow.dumbleDoorMinecraft;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import nyan.meow.dumbleDoorMinecraft.utils.HttpUtil;
import org.bukkit.*;
import org.bukkit.block.data.Powerable;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.inventory.InventoryPickupItemEvent;
import org.bukkit.event.player.PlayerDropItemEvent;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.persistence.PersistentDataType;

import java.util.*;

public class DoorManager implements Listener {
    private Main plugin;
    private List<Door> doors;


    // PlayerKey dropped by
    private NamespacedKey playerKey;

    public DoorManager(Main main) {
        this.plugin = main;
        this.playerKey = new NamespacedKey(plugin, "droppedBy");
        this.doors = new ArrayList<>();
        initializeDoors();
        fetchDoorsFromApi();
    }

    public void addDoor(Door door) {
        doors.add(door);
    }

    public List<Door> getDoors() {
        return doors;
    }

    // Method to initialize doors from JSON (replace with your JSON string)
    public void initializeDoors() {
        PluginConfig config = plugin.getPluginConfig();
        for (Door door : config.getDoors()) {
            addDoor(door);
            System.out.println("Initialized door: " + door.getId());
        }
    }

    private String getColorForAccessLevel(int accessLevel) {
        switch (accessLevel) {
            case 0:
                return ChatColor.GREEN + "0";
            case 1:
                return ChatColor.YELLOW + "1";
            case 2:
                return ChatColor.BLUE + "2";
            case 3:
                return ChatColor.RED + "3";
            default:
                return ChatColor.GRAY + "Unknown";
        }
    }

    private void fetchDoorsFromApi() {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                HttpUtil httpUtil = new HttpUtil(plugin);
                String response = httpUtil.fetchData(this.plugin.getPluginConfig().getDoorServiceUrl() + "/api/internal/doors");
                JsonArray doorArray = JsonParser.parseString(response).getAsJsonArray();

                for (var doorJson : doorArray) {
                    JsonObject doorObj = doorJson.getAsJsonObject();
                    String id = doorObj.get("id").getAsString();
                    String name = doorObj.get("name").getAsString();
                    int accessLevel = doorObj.get("access_level").getAsInt();

                    Door door = doors.stream().filter(d -> d.getId().equals(id)).findFirst().orElse(null);
                    if (door != null) {
                        door.setName(name);
                        door.setAccessLevel(accessLevel);
                        System.out.println("Updated door: " + door.getId());

                        String[] signText = new String[4];
                        signText[0] = "Door: " + door.getName();
                        signText[1] = "Access Level: " + getColorForAccessLevel(door.getAccessLevel());
                        signText[2] = "";
                        signText[3] = "";

                        Bukkit.getScheduler().runTask(plugin, () -> {
                            door.updateSignText(signText);
                        });

                    }
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    @EventHandler
    public void onDebugRightClick(PlayerInteractEvent event) {
        if (event.getAction() == Action.RIGHT_CLICK_BLOCK && event.getPlayer().isSneaking()) {
            if (event.getClickedBlock() != null) {
                for (Door door : doors) {
                    if (isBlockAtLocation(event.getClickedBlock().getLocation(), door.getReaderBlock().toLocation())) {
                        Player p = event.getPlayer();
                        p.sendMessage("Door ID: " + door.getId());
                        p.sendMessage("Door Name: " + door.getName());
                        p.sendMessage("Access Level: " + door.getAccessLevel());
                        p.sendMessage("Open Time: " + door.getOpenTime());
                    }
                }
            }
        }
    }
    @EventHandler
    private void onExitSwitch(PlayerInteractEvent event) {
        if (event.getAction() == Action.RIGHT_CLICK_BLOCK) {
            if (event.getClickedBlock() != null) {
                for (Door door : doors) {
                    if (isBlockAtLocation(event.getClickedBlock().getLocation(), door.getExitSwitch().toLocation())) {
                        Player player = event.getPlayer();
                        player.sendMessage("Exit Switch: " + door.getId());

                        requestUnlockDoorExit(player, door.getId());
                    }
                }
            }
        }

    }

    @EventHandler
    public void onPlayerDropItem(PlayerDropItemEvent event) {
        ItemStack droppedItem = event.getItemDrop().getItemStack();
        Player player = event.getPlayer();

        // Add player name as metadata
        ItemMeta meta = droppedItem.getItemMeta();
        if (meta != null) {
            meta.getPersistentDataContainer().set(playerKey, PersistentDataType.STRING, player.getName());
            droppedItem.setItemMeta(meta);
        }
    }

    @EventHandler
    public void onHopperItemDrop(InventoryPickupItemEvent event) {
        event.getInventory();

        if (!event.getInventory().getType().toString().equals("HOPPER")) {
            return;
        }

        Location l = event.getInventory().getLocation();
        if (l == null) {
            return;
        }

        boolean isReaderBlock = false;
        for (Door door : doors) {
            if (isBlockAtLocation(l, door.getReaderBlock().toLocation())) {
                isReaderBlock = true;
                break;
            }
        }

        if (!isReaderBlock) {
            return;
        }

        event.setCancelled(true);

        ItemStack item = event.getItem().getItemStack();

        event.getItem().remove();

        ItemMeta itemMeta = item.getItemMeta();
        if (itemMeta == null) {
            return;
        }

        String playerName = item.getItemMeta().getPersistentDataContainer().get(playerKey, PersistentDataType.STRING);
        if (playerName != null) {
            Player player = Bukkit.getPlayer(playerName);
            if (player != null) {
                player.getInventory().addItem(item);
                // Get door id from item
                String cardId = itemMeta.getPersistentDataContainer().get(new NamespacedKey(plugin, "card_id"), PersistentDataType.STRING);
                // Find what door have this reader block
                Door readerDoor = doors.stream().filter(d -> isBlockAtLocation(l, d.getReaderBlock().toLocation())).findFirst().orElse(null);

                if (readerDoor == null) {
                    player.sendMessage("Door not found");
                    return;
                }

                if (cardId != null) {
                    player.sendMessage("Scanned card: " + cardId);
                    requestUnlockDoor(player, cardId, readerDoor.getId());
                }
                //player.sendMessage("You have received: " + item.getAmount() + " x " + item.getType());
            }
        }
    }

    private void requestUnlockDoorExit(Player player, String doorId) {
        Door door = doors.stream().filter(d -> d.getId().equals(doorId)).findFirst().orElse(null);
        if (door == null) {
            player.sendMessage("Door not found: " + doorId);
            return;
        }
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                HttpUtil httpUtil = new HttpUtil(plugin);
                String response = httpUtil.fetchData(this.plugin.getPluginConfig().getButtonServiceUrl() + "/api/internal/triggerButton?&doorId=" + door.getId());
                boolean success = Objects.equals(response, "true");

                BlockCoordinates exitSwitch = door.getExitSwitch();

                Bukkit.getScheduler().runTask(plugin, () -> {
                    if (success) {
                        door.unlock(player);
                        player.playSound(player.getLocation(), Sound.BLOCK_NOTE_BLOCK_CHIME, 1.0F, 2.0F);
                        if (exitSwitch != null) {
                            Location l = exitSwitch.toLocation();
                            if (l.getBlock().getBlockData() instanceof Powerable powerable) {
                                powerable.setPowered(true);
                                l.getBlock().setBlockData(powerable);
                            }
                        }

                        Bukkit.getScheduler().runTaskLater(plugin, () -> {
                            door.lock(player);
                            player.playSound(player.getLocation(), Sound.BLOCK_BARREL_CLOSE, 1.0F, 1.0F);

                            if (exitSwitch != null) {
                                Location l = exitSwitch.toLocation();
                                if (l.getBlock().getBlockData() instanceof Powerable powerable) {
                                    powerable.setPowered(false);
                                    l.getBlock().setBlockData(powerable);
                                }
                            }

                        }, door.getOpenTime());

                    } else {
                        player.sendMessage("Failed to unlock door: " + door.getId());
                    }
                });

            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private void requestUnlockDoor(Player player, String cardId, String doorId) {
        Door door = doors.stream().filter(d -> d.getId().equals(doorId)).findFirst().orElse(null);
        if (door == null) {
            player.sendMessage("Door not found: " + doorId);
            return;
        }

        // /api/internal/requestLock
        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                HttpUtil httpUtil = new HttpUtil(plugin);
                String response = httpUtil.fetchData(this.plugin.getPluginConfig().getDoorServiceUrl() + "/api/internal/requestLock?cardId=" + cardId + "&doorId=" + door.getId());
                boolean success = Objects.equals(response, "true");

                Bukkit.getScheduler().runTask(plugin, () -> {
                    if (success) {
                        door.unlock(player);
                        player.playSound(player.getLocation(), Sound.BLOCK_NOTE_BLOCK_CHIME, 1.0F, 2.0F);


                        Bukkit.getScheduler().runTaskLater(plugin, () -> {
                            door.lock(player);
                            player.playSound(player.getLocation(), Sound.BLOCK_BARREL_CLOSE, 1.0F, 1.0F);
                        }, door.getOpenTime());
                    } else {
                        player.sendMessage("Failed to unlock door: " + door.getId());
                    }
                });

            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    // Check if block at same location
    private boolean isBlockAtLocation(Location a, Location b) {
        return a.getBlockX() == b.getBlockX() && a.getBlockY() == b.getBlockY() && a.getBlockZ() == b.getBlockZ();
    }

}