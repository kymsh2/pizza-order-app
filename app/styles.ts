import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  orderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    width: 300,
    backgroundColor: "#fff",
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  timerContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  timerText: {
    backgroundColor: "#ffeb3b",
    color: "#333",
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 16,
    minWidth: 80,
    textAlign: "right",
  },
});

export default styles;
