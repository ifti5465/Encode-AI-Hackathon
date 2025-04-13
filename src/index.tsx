import React from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { configureSyncEngine } from "@tonk/keepsync";
import {
  registerServiceWorker,
  unregisterServiceWorker,
} from "./serviceWorkerRegistration";

// Service worker logic based on environment
if (process.env.NODE_ENV === "production") {
  // Only register service worker in production mode
  registerServiceWorker();
} else {
  // In development, make sure to unregister any existing service workers
  unregisterServiceWorker();
}

const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${wsProtocol}//${window.location.host}/sync`;

// Generate a unique app instance ID (or retrieve existing one)
const getAppInstanceId = () => {
  const storedId = localStorage.getItem('flatmade_instance_id');
  if (storedId) {
    return storedId;
  }
  const newId = crypto.randomUUID();
  localStorage.setItem('flatmade_instance_id', newId);
  return newId;
};

// Configure the sync engine with persistence
configureSyncEngine({
  url: wsUrl,
  // Add unique instance name per device for better syncing
  name: `flatmade-${getAppInstanceId()}`,
  // Enable persistent storage
  storage: {
    persistent: true,
    prefix: 'flatmade'
  },
  onSync: (docId) => console.log(`Document ${docId} synced`),
  onError: (error) => console.error("Sync error:", error),
  // Add reconnection logic
  reconnectDelay: 1000,
  maxReconnectAttempts: 10
});

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
