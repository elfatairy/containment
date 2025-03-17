#include <TinyGPS++.h>
#include <WiFi.h>

#include <Firebase_ESP_Client.h>

#define API_KEY "AIzaSyD0CQ0e4sM8ElzYBumMYeOCj7jj3BHuKtM"
#define DATABASE_URL "autisim-718d2-default-rtdb.asia-southeast1.firebasedatabase.app"

const char* ssid = "fablab";
const char* password = "12345678";

FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

// تعريف مستشعر الاهتزاز
#define VIBRATION_SENSOR_PIN 34

// إعداد GPS
HardwareSerial gpsSerial(1);
TinyGPSPlus gps;
float latitude, longitude;

// تعريف مستشعر نبض القلب
#define PULSE_SENSOR_PIN 32 // تغيير الرقم حسب توصيل المستشعر
#define LED_PIN 13          // LED للإشارة إلى النبض
int Threshold = 550;

void setup() {
  Serial.begin(115200);

  // تهيئة المستشعرات
  pinMode(VIBRATION_SENSOR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);

  Serial.println("Sensors Initialized...");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

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
}

void loop() {
  // قراءة مستشعر الاهتزاز
  int vibrationState = digitalRead(VIBRATION_SENSOR_PIN);

  // قراءة بيانات GPS
  while (gpsSerial.available()) {
    if (gps.encode(gpsSerial.read())) {
      latitude = gps.location.lat();
      longitude = gps.location.lng();
    }
  }

  // قراءة مستشعر النبض
  int Signal = analogRead(PULSE_SENSOR_PIN);

  // تشغيل LED عند تجاوز العتبة
  digitalWrite(LED_PIN, Signal > Threshold ? HIGH : LOW);

  if (Firebase.ready()) {
    if(!Firebase.RTDB.setInt(&fbdo, "readings/heartrate", Signal))
      Serial.println("REASON: " + fbdo.errorReason());
      
      
    if(!Firebase.RTDB.setString(&fbdo, "readings/vibration", vibrationState ? "detected" : "undetected"))
      Serial.println("REASON: " + fbdo.errorReason());
      
    if(!Firebase.RTDB.setFloat(&fbdo, "readings/location/latitude", latitude))
      Serial.println("REASON: " + fbdo.errorReason());
    if(!Firebase.RTDB.setFloat(&fbdo, "readings/loation/longitude", longitude))
      Serial.println("REASON: " + fbdo.errorReason());
  }

  delay(1000);
}