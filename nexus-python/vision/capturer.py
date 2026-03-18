import base64
import io
import mss
from PIL import Image

class ScreenCapturer:
    def __init__(self):
        self.sct = mss.mss()

    def capture_base64(self) -> str:
        """
        Captures the primary monitor and returns a base64 encoded JPEG string.
        """
        # Grab the primary monitor
        monitor = self.sct.monitors[1]
        sct_img = self.sct.grab(monitor)
        
        # Convert to PIL Image
        img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
        
        # Optimize size for LLM input
        max_size = (1920, 1080)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save to bytes buffer as JPEG
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG", quality=85)
        
        # Encode to base64
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{img_str}"
