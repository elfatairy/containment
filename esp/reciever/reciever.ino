#define BLYNK_TEMPLATE_ID "TMPL2Hfwlew-v"
#define BLYNK_TEMPLATE_NAME "Feedback system"
#define BLYNK_AUTH_TOKEN "vsuSrUKLocanBleWmq22HPPkh-UNGvwh"  // ⚠ استبدله برمز جديد آمن!

#include <Arduino.h>
#include <WiFi.h>
#include <DFRobotDFPlayerMini.h>

#include <Firebase_ESP_Client.h>

#define API_KEY "AIzaSyBWzI5cu4fP1XjNNWUjBo_iiVxc_geRn1Y"
#define DATABASE_URL "autisim-718d2-default-rtdb.asia-southeast1.firebasedatabase.app"

FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

#define RX_PIN 16  // RX على ESP32
#define TX_PIN 17  // TX على ESP32
#define RELAY_PIN 23 // دبوس التحكم في المضخة

char ssid[] = "FabLab";
char pass[] = "12345678";

HardwareSerial mySerial(1);  // استخدام UART1
DFRobotDFPlayerMini myDFPlayer;
int pumpState = LOW;


void run() {
    Serial.println("Playing Music...");
    myDFPlayer.play(1);
    digitalWrite(RELAY_PIN, 1);
    Serial.println("Pump ON");
}

void stop() {
    Serial.println("Stopping Music...");
    myDFPlayer.play(0);
    digitalWrite(RELAY_PIN, 0);
    Serial.println("Pump OFF");
}

bool prevValue;

void streamCallback(StreamData data) {
  if (data.dataType() == "int") {
    int value = data.to<int>();
    if (value == 0) {
      if(prevValue) {
        stop();
        prevValue = false;
      }
    } else {
      if(!prevValue) {
        run(value);
        prevValue = true;
      }
    }
  } else {
    Serial.println("Received data is not an integer!");
  }
}

void streamTimeoutCallback(bool timeout) {
  if (timeout) {
    Serial.println("Stream timed out, resuming...");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // تأكد من أن المضخة مغلقة عند بدء التشغيل

  mySerial.begin(9600, SERIAL_8N1, RX_PIN, TX_PIN);  // إعداد الاتصال مع DFPlayer Mini

  WiFi.begin(ssid, pass);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi Connected!");
  
  Serial.println("Initializing DFPlayer Mini...");
  if (!myDFPlayer.begin(mySerial)) {
    Serial.println("DFPlayer Mini not detected! Check wiring.");
    while (true);
  }
  Serial.println("DFPlayer Mini Online.");
  myDFPlayer.volume(30);  // تعيين مستوى الصوت بين 0 إلى 30
  

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("ok");
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  FB_RTDB rtdb;

  // Set the stream callback
  rtdb.setStreamCallback(&fbdo, streamCallback, streamTimeoutCallback);

  // Begin streaming at the desired path (e.g., "/myInteger")
  if (!rtdb.beginStream(&fbdo, "/currentNotification")) {
    Serial.println("Failed to begin stream: " + fbdo.errorReason());
  }
}

void loop() {
  if (!rtdb.readStream(&fbdo)) {
    Serial.println("Stream read failed: " + fbdo.errorReason());
  }

  if (!Firebase.ready()) {
    Serial.println("Firebase not ready, reconnecting...");
    Firebase.reconnectWiFi(true);
  }
}







