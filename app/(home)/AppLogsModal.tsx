import { clearAppLogs, getAppLogs } from "@/src/utils/logger";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface AppLogsModalProps {
  trigger: React.ReactNode; // element that triggers the modal
}

const AppLogsModal: React.FC<AppLogsModalProps> = ({ trigger }) => {
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState(getAppLogs());

  const openLogs = () => {
    setLogs(getAppLogs()); // refresh logs
    setShowLogs(true);
  };

  const closeLogs = () => setShowLogs(false);

  const clearLogsHandler = () => {
    clearAppLogs();
    setLogs([]);
  };

  return (
    <>
      <Pressable onLongPress={openLogs} delayLongPress={5000}>
        {trigger}
      </Pressable>

      <Modal visible={showLogs} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>📝 App Logs</Text>
          <FlatList
            data={logs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={[styles.logText, styles[`log${item.level}`]]}>
                [{item.time}] {item.message}
              </Text>
            )}
          />
          <View style={styles.modalButtons}>
            <Text style={styles.button} onPress={closeLogs}>
              Close
            </Text>
            <Text style={styles.button} onPress={clearLogsHandler}>
              Clear Logs
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AppLogsModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#111",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  logText: {
    fontSize: 12,
    marginBottom: 2,
    color: "#ccc",
  },
  logLOG: { color: "#fff" },
  logWARN: { color: "yellow" },
  logERROR: { color: "red" },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    color: "#1E90FF",
    fontSize: 16,
    padding: 8,
  },
});
