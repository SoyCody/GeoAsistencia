import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>

   


      <Text style={styles.title}>GeoAsistencia</Text>

      {/* Aquí luego integrarás el mapa */}
      <View style={styles.mapPlaceholder}>
        <Text>MAPA</Text>
      </View>

      <TouchableOpacity style={styles.entryButton}>
        <Text style={styles.buttonText}>Marcar Entrada</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exitButton}>
        <Text style={styles.buttonText}>Marcar Salida</Text>
      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#0A1E4A",
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  entryButton: {
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  exitButton: {
    backgroundColor: "#C62828",
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
