package nyan.meow.dumbleDoorMinecraft.listeners;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import nyan.meow.dumbleDoorMinecraft.Main;
import nyan.meow.dumbleDoorMinecraft.PluginConfig;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.NamespacedKey;
import org.bukkit.block.Block;
import org.bukkit.block.Chest;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.persistence.PersistentDataType;

import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;

public class ChestListener implements Listener {

    public Main plugin;

    public ChestListener(Main main) {
        this.plugin = main;
    }

    @EventHandler
    public void onPlayerInteract(PlayerInteractEvent event) {
        Player player = event.getPlayer();
        Block block = event.getClickedBlock();

        // Check if the block is a chest and the action is right-click
        if (block != null && block.getType() == Material.CHEST && event.getAction() == Action.RIGHT_CLICK_BLOCK) {
            Chest chest = (Chest) block.getState();
            if (chest.getCustomName() != null && chest.getCustomName().equals("Card Chest")) {
                fetchDataFromApi(player, (Chest) event.getClickedBlock().getState());
            }
        }
    }


    private void fetchDataFromApi(Player player, Chest chest) {
        // Example API URL (replace with your own)
        PluginConfig config = plugin.getPluginConfig();
        String apiUrl = config.getCardServiceUrl() + "/api/internal/cards";

        // Create the HTTP request
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Authorization", "Bearer " + config.getApiSecret())
                .GET()
                .build();

        java.net.http.HttpClient httpClient = java.net.http.HttpClient.newHttpClient();

        // Perform the request asynchronously
        CompletableFuture<HttpResponse<String>> responseFuture = httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString());

        // When the request completes, process the response
        responseFuture.thenAccept(response -> {
            if (response.statusCode() == 200) {
                // Assuming the API returns some data, we process it here
                String responseData = response.body();

                // Log the API response
                Bukkit.getLogger().info("API Response: " + responseData);

                // Open the chest and fill it with paper
                openAndFillChest(player, chest, responseData);
            } else {
                // If the request failed, send a message to the player
                player.sendMessage("Failed to fetch data from the API.");
            }
        }).exceptionally(ex -> {
            // Handle exceptions
            player.sendMessage("Error occurred while fetching data.");
            return null;
        });
    }

    private void openAndFillChest(Player player, Chest chest, String responseData) {
        Bukkit.getScheduler().runTask(Objects.requireNonNull(Bukkit.getPluginManager().getPlugin("DumbleDoorMinecraft")), () -> {
            Inventory chestInventory = chest.getInventory();

            chestInventory.clear();

            List<ItemStack> cardItems = new ArrayList<>();

            JsonArray cards = JsonParser.parseString(responseData).getAsJsonArray();

            for (JsonElement cardElement : cards) {
                JsonObject card = cardElement.getAsJsonObject();
                String cardId = card.get("id").getAsString();
                String cardName = card.get("name").getAsString();
                String userId = card.has("user_id") ? card.get("user_id").getAsString() : "N/A";
                String assignedBy = card.get("assigned_by").getAsString();
                String createdAt = card.get("created_at").getAsString();
                String updatedAt = card.get("updated_at").getAsString();

                // Create a paper item with NBT data
                ItemStack cardItem = new ItemStack(Material.PAPER);
                ItemMeta itemMeta = cardItem.getItemMeta();
                if (itemMeta != null) {
                    itemMeta.setDisplayName(cardName);

                    // Create lore for the card item
                    List<String> lore = new ArrayList<>();
                    lore.add("Card ID: " + cardId);
                    lore.add("Assigned By: " + assignedBy);
                    lore.add("Created At: " + createdAt);
                    lore.add("Updated At: " + updatedAt);
                    lore.add("User ID: " + userId);
                    itemMeta.setLore(lore);

                    itemMeta.getPersistentDataContainer().set(new NamespacedKey(plugin, "card_id"), PersistentDataType.STRING, cardId);

                    cardItem.setItemMeta(itemMeta);
                }

                cardItems.add(cardItem);
            }

            int index = 0;
            for (ItemStack cardItem : cardItems) {
                if (index < chestInventory.getSize()) {
                    chestInventory.setItem(index, cardItem);
                    index++;
                }
            }

            //player.sendMessage("The chest has been filled with cards!");
            player.openInventory(chestInventory);
        });
    }

}