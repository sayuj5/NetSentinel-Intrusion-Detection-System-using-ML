from scapy.all import sniff, IP, TCP, UDP, ICMP, get_working_if
import requests
import logging
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - SENTINEL-NODE - %(levelname)s - %(message)s')

class WindowsSecurityEngine:
    def __init__(self, prediction_url="http://127.0.0.1:5001/predict", dashboard_url=None):
        self.prediction_url = prediction_url
        # Use Vercel URL if provided in environment, otherwise local
        self.dashboard_url = dashboard_url or os.getenv("VERCEL_API_URL", "http://127.0.0.1:5055/realtime_data")
        self.active = False
        
        try:
            self.interface = get_working_if().name
            logging.info(f"Sentinel Node Active on: {self.interface}")
            logging.info(f"Target Dashboard: {self.dashboard_url}")
        except Exception:
            self.interface = None

    def _extract_features(self, packet):
        if IP not in packet: return None
        return {
            'src_ip': packet[IP].src,
            'dst_ip': packet[IP].dst,
            'protocol_type': "tcp" if TCP in packet else "udp" if UDP in packet else "icmp" if ICMP in packet else "other",
            'service': str(packet.dport) if hasattr(packet, 'dport') else 'other',
            'src_bytes': len(packet),
            'dst_bytes': 0,
            'is_intrusion': False # To be filled by prediction API
        }

    def process_packet(self, packet):
        features = self._extract_features(packet)
        if not features: return

        try:
            # 1. AI Prediction (Stay local for speed)
            res = requests.post(self.prediction_url, json=features, timeout=1).json()
            features.update(res)
            
            # 2. Push to Vercel Dashboard
            requests.post(self.dashboard_url, json=features, timeout=2)
        except Exception as e:
            logging.debug(f"Sync error: {e}")

    def start(self):
        if not self.interface: return
        self.active = True
        logging.info("Windows Engine streaming to Cloud...")
        sniff(iface=self.interface, prn=self.process_packet, store=0)

if __name__ == "__main__":
    engine = WindowsSecurityEngine()
    engine.start()
