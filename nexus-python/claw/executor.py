import pyautogui
import time
from pydantic import BaseModel
from typing import Optional
from .safety import SafetyEnforcer, SafetyTier

def draw_annotation_box(x: Optional[int], y: Optional[int], width: int = 40, height: int = 40, duration: float = 0.4):
    """Draws a temporary red bounding box on the screen before an action."""
    if x is None or y is None: return
    try:
        import tkinter as tk
        root = tk.Tk()
        root.overrideredirect(True)
        root.attributes("-topmost", True)
        # macOS transparency hack
        root.attributes("-transparent", True)
        root.config(bg='systemTransparent')
        
        safe_x: int = int(x)
        safe_y: int = int(y)
        root.geometry(f"{width}x{height}+{int(safe_x - width/2)}+{int(safe_y - height/2)}")
        
        canvas = tk.Canvas(root, width=width, height=height, bg='systemTransparent', highlightthickness=0)
        canvas.pack()
        canvas.create_rectangle(0, 0, width-1, height-1, outline="red", width=4)
        
        root.update()
        time.sleep(duration)
        root.destroy()
    except Exception:
        pass # Fallback cleanly if no GUI display is available

class ClawAction(BaseModel):
    type: str # 'click', 'type', 'hotkey', 'scroll', 'drag', 'move'
    x: Optional[int] = None
    y: Optional[int] = None
    text: Optional[str] = None
    keys: Optional[list[str]] = None
    clicks: Optional[int] = 1
    button: Optional[str] = 'left' # 'left', 'right', 'middle'
    scroll_amount: Optional[int] = None

class ClawExecutor:
    def __init__(self):
        self.safety = SafetyEnforcer(SafetyTier.LOCKED)
        # Slow down pyautogui for more reliable LLM actions
        pyautogui.PAUSE = 0.5 

    def execute(self, action: ClawAction) -> dict:
        if not self.safety.can_execute(action.type):
            return {"success": False, "error": f"Action '{action.type}' blocked by Safety Tier: {self.safety.tier.value}"}

        try:
            if action.type == 'click':
                if action.x is not None and action.y is not None:
                    draw_annotation_box(action.x, action.y)
                    pyautogui.click(x=action.x, y=action.y, clicks=action.clicks, button=action.button)
                else:
                    pyautogui.click(clicks=action.clicks, button=action.button)
                    
            elif action.type == 'move':
                if action.x is not None and action.y is not None:
                    pyautogui.moveTo(action.x, action.y, duration=0.2)
                    
            elif action.type == 'type':
                if action.text:
                    pyautogui.write(action.text, interval=0.02)
                    
            elif action.type == 'hotkey':
                if action.keys:
                    pyautogui.hotkey(*action.keys)
                    
            elif action.type == 'scroll':
                if action.scroll_amount:
                    pyautogui.scroll(action.scroll_amount)
                    
            elif action.type == 'drag':
                if action.x is not None and action.y is not None:
                    draw_annotation_box(action.x, action.y)
                    pyautogui.dragTo(action.x, action.y, duration=0.5, button=action.button)
            
            else:
                return {"success": False, "error": f"Unknown action type: {action.type}"}
                
            return {"success": True, "action": action.dict()}
            
        except pyautogui.FailSafeException:
            return {"success": False, "error": "Emergency Stop: Mouse moved to edge of screen (FailSafeTriggered)."}
        except Exception as e:
            return {"success": False, "error": str(e)}
