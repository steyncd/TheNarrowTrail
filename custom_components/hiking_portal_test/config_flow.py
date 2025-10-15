"""Test config flow."""
import voluptuous as vol
from homeassistant import config_entries

DOMAIN = "hiking_portal_test"

class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow."""
    
    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step.""" 
        if user_input is not None:
            return self.async_create_entry(
                title="Test Integration", 
                data={"test": "working"}
            )
            
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required("test", default="test"): str,
            })
        )