package nyan.meow.dumbleDoorMinecraft.utils;

import nyan.meow.dumbleDoorMinecraft.Main;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class HttpUtil {

    private final Main plugin;

    public HttpUtil(Main main) {
        this.plugin = main;
    }

    public String fetchData(String urlString) throws Exception {
        URL url = new URL(urlString);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("GET");

        // Auth headers
        con.setRequestProperty("Authorization", "Bearer " + this.plugin.getPluginConfig().getApiSecret());

        int responseCode = con.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) { // success
            BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();

            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }

            // close connections
            in.close();
            con.disconnect();

            return content.toString();
        } else {
            throw new Exception("Failed to fetch data from API: " + responseCode);
        }
    }
}