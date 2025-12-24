import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 18,
    alignSelf: "flex-start",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
  },
  tab: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 8,
    fontSize: 16,
    color: "#888",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 8,
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#ff9800",
  },
  orderListItem: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#eee",
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderLeftAdjusted: {
    flexDirection: 'column',
    flex: 1,
    marginLeft: 4,
  },
  orderStatusIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    // marginBottom: 18,
    position: "relative", // REQUIRED
  },
  orderStatusWrapper: {
    alignItems: "center",
    width: 40, // keeps layout stable
  },
  orderStatusIcon: {
    position: "absolute", // 🔒 LOCK ICON
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    textAlignVertical: "center", // Android
    alignSelf: "center",
  },
  pickupTimerText: {
    marginTop: 6,
    fontSize: 11,
    color: "#ff6d01",
    fontWeight: "600"
  },

   //////////////////

  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
   orderStatusNew: {
    fontSize: 12,
    color: "#71dc62",
    marginTop: 2,
    fontWeight: "bold",
  },
  orderStatusAccepted: {
    fontSize: 10,
    color: "#ff6d01",
    marginTop: 2,
    fontWeight: "bold",
  },
  orderStatusCompleted: {
    fontSize: 10,
    color: "#505050",
    marginTop: 2,
    fontWeight: "bold",
  },
  orderAmount: {
     fontSize: 14 ,
     fontWeight: "bold",
    // color: "#4caf50",
    marginLeft: 32,
  },
  orderDetailSection: {
    marginBottom: 22,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  orderDetailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  orderDetailValue: {
    fontSize: 15,
    marginBottom: 8,
    color: '#444',
  },
  orderItemRow: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  orderItemMeta: {
    fontSize: 13,
    color: '#888',
    marginLeft: 8,
  },
  orderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orderOverlayText: {
    width: "100%",
    height: "100%",
    opacity: 0,
  },

  // ORDER DETAIL STYLES
  orderDetailContainer: { padding: 18, backgroundColor: "#fff" },


  totalText: { fontSize: 26, fontWeight: "bold", marginBottom: 8 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7ffe7",
    padding: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusText: { marginLeft: 6, color: "green", fontWeight: "600" },

  metaBox: { borderBottomWidth: 1, borderColor: "#e5e5e5", paddingBottom: 15 },
  row: { flexDirection: "row", marginBottom: 4 },
  rowLabel: { width: 120, color: "#444" },
  rowValue: { color: "#222" },

  customerBox: { paddingVertical: 18 },
  // customerName: { fontSize: 18, fontWeight: "600" },
  firstOrder: { color: "#007aff", marginBottom: 10 },
  rowIcon: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  contactText: { marginLeft: 8, fontSize: 15 },
  note: { color: "#007aff", marginTop: 8, fontSize: 13 },

  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 10 },
  itemRow: { flexDirection: "row", marginVertical: 12 },
  itemQty: { marginRight: 10, fontSize: 16 },
  itemName: { fontSize: 14 },
  sizeText: { fontSize: 13, color: "#555" },

  leftSection: {
    flexDirection: "row",
    flex: 1,
  },
  itemAmount: {
    fontSize: 14,    
    textAlign: "right",
    fontWeight: "400",
  },
  totalLabel: { fontSize: 16, fontWeight: "600" },
  totalAmount: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },

  summaryBox: { marginTop: 20 },

  ///////////////////////////////////////////



/* =========================
     ACTION BUTTONS
  ========================== */

  acceptButton: {
    backgroundColor: "#2e7d32", // green
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10
  },

  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5
  },

  cancelButton: {
    backgroundColor: "#b71c1c", // red
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },

  cancelButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600"
  },

  /* =========================
     PICKUP TIME SELECTOR
  ========================== */

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 12
  },

  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    minWidth: 70,
    alignItems: "center"
  },

  timeButtonSelected: {
    backgroundColor: "#2e7d32",
    borderColor: "#2e7d32"
  },

  timeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333"
  },

  ///////////////////

  
  /////////////

  // 🔴 DEBUG STYLES — REMOVE AFTER FIX
debugRed: {
  borderWidth: 1,
  borderColor: "red",
},

debugBlue: {
  borderWidth: 1,
  borderColor: "blue",
},

debugGreen: {
  borderWidth: 1,
  borderColor: "green",
},

debugYellow: {
  borderWidth: 1,
  borderColor: "orange",
},
////////////////////


});

export default styles;
