import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ConfirmScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmación</Text>

      <Text style={styles.label}>Hora:</Text>
      <Text style={styles.value}>08:32</Text>

      <Text style={styles.label}>Ubicación:</Text>
      <Text style={styles.value}>Dentro de la oficina ✓</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>ACEPTAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#0A1E4A",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#0A1E4A",
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
