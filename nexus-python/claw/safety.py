from enum import Enum
import pyautogui
from typing import Optional

class SafetyTier(str, Enum):
    GHOST = "ghost"     # Read-only (screenshots allowed, no interaction)
    GUIDED = "guided"   # Confirms destructive actions (requires user approval for clicks/typing via UI)
    LOCKED = "locked"   # Allows interaction, but blacklisted apps trigger emergency stops

class SafetyEnforcer:
    def __init__(self, current_tier: SafetyTier = SafetyTier.LOCKED):
        self.tier = current_tier
        self.blacklisted_apps = ["Terminal", "Activity Monitor", "System Settings"]
        
        # PyAutoGUI Failsafe: moving mouse to 0,0 kills the process
        pyautogui.FAILSAFE = True

    def set_tier(self, new_tier: SafetyTier):
        self.tier = new_tier

    def can_execute(self, action_type: str) -> bool:
        """
        Validates if an action is allowed under the current safety tier.
        """
        if self.tier == SafetyTier.GHOST:
            return False # Ghost mode prevents any action execution
            
        if self.tier == SafetyTier.GUIDED:
            # Need strict UI prompt confirmation (implemented in Tauri Rust)
            # Python sidecar allows it technically, but rust will hold the prompt
            return True
            
        if self.tier == SafetyTier.LOCKED:
            return True # Allowed

        return False
