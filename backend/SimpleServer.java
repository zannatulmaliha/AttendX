
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.stream.Collectors;

public class SimpleServer {

    // Simple in-memory user storage
    private static List<User> users = new ArrayList<>();
    private static List<Attendance> attendanceRecords = new ArrayList<>();

    static {
        // Dummy data for attendance (matches a default user we might want to test with)
        // Using ID "123456" for demo purposes
        attendanceRecords.add(new Attendance("John Doe", "123456", "CS101", "Room 303", "Present",
                LocalDate.now().toString()));
        attendanceRecords
                .add(new Attendance("John Doe", "123456", "CS102", "Room 202", "Absent", "2023-10-26"));
        attendanceRecords.add(new Attendance("Jane Smith", "654321", "CS101", "Room 303", "Present",
                LocalDate.now().toString()));
    }

    public static void main(String[] args) throws IOException {
        int port = 8081;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/signup", new SignupHandler());
        server.createContext("/login", new LoginHandler());
        server.createContext("/attendance", new AttendanceHandler());

        server.setExecutor(null); // creates a default executor
        System.out.println("Server started on port " + port);
        server.start();
    }

    static class User {
        String name;
        String id;
        String email; // This is the backup email
        String role;

        User(String name, String id, String email, String role) {
            this.name = name;
            this.id = id;
            this.email = email;
            this.role = role;
        }
    }

    static class Attendance {
        String studentName;
        String studentId;
        String course;
        String classroom;
        String status; // "Present" or "Absent"
        String date;

        Attendance(String studentName, String studentId, String course, String classroom, String status,
                String date) {
            this.studentName = studentName;
            this.studentId = studentId;
            this.course = course;
            this.classroom = classroom;
            this.status = status;
            this.date = date;
        }
    }

    // Helper to read JSON body simply (assuming flat JSON)
    private static String getBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        StringBuilder body = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            body.append(line);
        }
        return body.toString();
    }

    // Helper to send response with CORS headers
    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().add("Content-Type", "application/json");

        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    // Handle OPTIONS requests for CORS
    private static void handleOptions(HttpExchange exchange) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            exchange.sendResponseHeaders(204, -1);
            return;
        }
    }

    static class SignupHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleOptions(exchange);
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod()))
                return;

            String body = getBody(exchange);
            // Manual JSON parsing (very basic)
            String name = extractJsonValue(body, "name");
            String id = extractJsonValue(body, "id");
            String email = extractJsonValue(body, "email");
            String role = extractJsonValue(body, "role");

            if (name == null || id == null || email == null || role == null) {
                sendResponse(exchange, 400, "{\"message\": \"Missing fields\"}");
                return;
            }

            // Check if user exists by ID
            for (User u : users) {
                if (u.id.equals(id)) {
                    sendResponse(exchange, 400, "{\"message\": \"User ID already exists\"}");
                    return;
                }
            }

            users.add(new User(name, id, email, role));
            System.out.println("New user registered: " + name + " (" + id + ") as " + role);
            sendResponse(exchange, 201, "{\"message\": \"User registered successfully\"}");
        }
    }

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleOptions(exchange);
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod()))
                return;

            String body = getBody(exchange);
            String id = extractJsonValue(body, "id");

            if (id == null) {
                sendResponse(exchange, 400, "{\"message\": \"Missing ID\"}");
                return;
            }

            for (User u : users) {
                if (u.id.equals(id)) {
                    // Return user info including ID and Backup Email
                    sendResponse(exchange, 200, "{\"message\": \"Login successful\", \"name\": \"" + u.name
                            + "\", \"id\": \"" + u.id + "\", \"email\": \"" + u.email + "\", \"role\": \"" + u.role
                            + "\"}");
                    return;
                }
            }

            sendResponse(exchange, 401, "{\"message\": \"Invalid User ID\"}");
        }
    }

    static class AttendanceHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleOptions(exchange);
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod()))
                return;

            // Get query param for id to filter
            String query = exchange.getRequestURI().getQuery();
            String idFilter = null;
            if (query != null && query.contains("id=")) {
                for (String param : query.split("&")) {
                    String[] pair = param.split("=");
                    if (pair.length > 1 && "id".equals(pair[0])) {
                        idFilter = pair[1];
                        break;
                    }
                }
            }

            final String finalId = idFilter;
            List<Attendance> filtered = attendanceRecords;

            if (finalId != null) {
                filtered = attendanceRecords.stream()
                        .filter(a -> a.studentId.equalsIgnoreCase(finalId))
                        .collect(Collectors.toList());
            }

            // Manually build JSON array
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < filtered.size(); i++) {
                Attendance a = filtered.get(i);
                json.append("{");
                json.append("\"studentName\":\"").append(a.studentName).append("\",");
                json.append("\"course\":\"").append(a.course).append("\",");
                json.append("\"classroom\":\"").append(a.classroom).append("\",");
                json.append("\"status\":\"").append(a.status).append("\",");
                json.append("\"date\":\"").append(a.date).append("\"");
                json.append("}");
                if (i < filtered.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");

            sendResponse(exchange, 200, json.toString());
        }
    }

    // Very naive JSON parser for "key": "value" strings
    private static String extractJsonValue(String json, String key) {
        String search = "\"" + key + "\":";
        int start = json.indexOf(search);
        if (start == -1)
            return null;

        start += search.length();
        while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == '"')) {
            start++;
        }

        int end = json.indexOf("\"", start);
        if (end == -1)
            return null;

        return json.substring(start, end);
    }
}
