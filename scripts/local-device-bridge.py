import asyncio
import json
import sys

from tapo import ApiClient


def emit(payload):
    sys.stdout.write(json.dumps(payload, ensure_ascii=True))


def clean_error(error):
    message = str(error).strip() or error.__class__.__name__
    if "Third-Party Compatibility" in message or 'kind: "FORBIDDEN"' in message:
        return "Tapo blokuje sterowanie lokalne. W aplikacji Tapo wlacz: Ja > Third-Party Services > Third-Party Compatibility."
    if "Invalid credentials" in message or "LOGIN_ERROR" in message or "HASH_MISMATCH" in message:
        return "Nieprawidlowy e-mail lub haslo konta Tapo."
    return message.replace("\n", " ")[:240]


async def tapo_handler(settings, device):
    username = str(settings.get("username", "")).strip()
    password = str(settings.get("password", ""))
    if not username or not password:
        raise RuntimeError("Brak danych konta Tapo")
    client = ApiClient(username, password, timeout_s=6)
    return await client.p100(device["ip"])


async def tapo_status(settings, device):
    handler = await tapo_handler(settings, device)
    return await tapo_status_from_handler(handler)


async def tapo_status_from_handler(handler):
    raw = await handler.get_device_info_json()
    info = json.loads(raw) if isinstance(raw, str) else raw
    active = bool(info.get("device_on", info.get("on", False)))
    return {"active": active, "available": True, "provider": "tapo", "source": "local-device"}


async def device_status(settings, device):
    try:
        if device.get("provider") == "tapo":
            return await tapo_status(settings.get("tapo", {}), device)
        raise RuntimeError("Nieobsługiwany typ urządzenia")
    except Exception as error:
        return {
            "active": False,
            "available": False,
            "provider": device.get("provider", "unknown"),
            "source": "local-device",
            "error": clean_error(error),
        }


async def toggle(settings, device):
    if device.get("provider") == "tapo":
        handler = await tapo_handler(settings.get("tapo", {}), device)
        current = await tapo_status_from_handler(handler)
        active = not current["active"]
        await (handler.on() if active else handler.off())
    else:
        raise RuntimeError("Nieobsługiwany typ urządzenia")
    return {"active": active, "available": True, "provider": device["provider"], "source": "local-device"}


async def main():
    request = json.loads(sys.stdin.read() or "{}")
    settings = request.get("settings", {})
    command = request.get("command", "status")
    devices = request.get("devices", [])

    if command == "status":
        results = await asyncio.gather(*(device_status(settings, device) for device in devices))
        emit({device["alias"]: result for device, result in zip(devices, results)})
        return
    if command == "toggle":
        device = request.get("device")
        if not device:
            raise RuntimeError("Nie wskazano urządzenia")
        emit(await toggle(settings, device))
        return
    raise RuntimeError("Nieznane polecenie mostu")


try:
    asyncio.run(main())
except Exception as error:
    emit({"error": clean_error(error)})
    sys.exit(1)
