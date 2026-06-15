const api = window.EndoDeckDesktop;
const $ = (selector) => document.querySelector(selector);
let diagnosis;
let toastTimer;
let rebootReady = false;

function notify(message, error = false) {
  clearTimeout(toastTimer);
  const toast = $("#toast");
  toast.textContent = message;
  toast.className = `show${error ? " error" : ""}`;
  toastTimer = setTimeout(() => { toast.className = ""; }, 4200);
}

function render(device) {
  diagnosis = device;
  document.body.classList.toggle("online", Boolean(device.connected));
  $("#device-state").textContent = device.connected ? `${device.manufacturer} ${device.model} · Android ${device.android} · ${device.serial}` : device.errors?.[0] || "Telefon offline";
  $("#compatibility").innerHTML = [
    `Android API ${device.sdk || "--"} ${device.sdk >= 24 && device.sdk <= 30 ? "✓" : "✕"}`,
    `Root ${device.root ? "✓" : "✕"} · Magisk ${device.magisk || "--"} ${device.magiskCompatible ? "✓" : "✕"}`,
    `WebView ${device.webView || "niewykryty"} ${device.webViewCompatible ? "✓" : "✕"}`
  ].map((item) => `<li>${item}</li>`).join("");
  $("#profile-state").textContent = device.profile ? `${device.profile.name} · APK ${device.profile.apkVariant}` : "Brak zgodnego profilu";
  $("#options").classList.toggle("hidden", !device.supported);
  $("#dt2w").disabled = !device.profile?.features.doubleTapWake;
  $("#battery").disabled = !device.profile?.features.batteryGuard;
  $("#dt2w").checked = Boolean(device.profile?.features.doubleTapWake);
  $("#battery").checked = Boolean(device.profile?.features.batteryGuard);
}

$("#scan").addEventListener("click", async () => {
  $("#scan").disabled = true;
  $("#scan").textContent = "SPRAWDZAM...";
  try { render(await api.diagnose()); }
  catch (error) { notify(error.message, true); }
  finally { $("#scan").disabled = false; $("#scan").textContent = "WYKRYJ TELEFON"; }
});

$("#install").addEventListener("click", async () => {
  if (!diagnosis?.serial) return;
  if (rebootReady) {
    rebootReady = false;
    $("#install").disabled = true;
    $("#install").textContent = "URUCHAMIAM...";
    try { await api.reboot(diagnosis.serial); notify("Telefon uruchamia się ponownie."); }
    catch (error) { notify(error.message, true); $("#install").disabled = false; $("#install").textContent = "URUCHOM TELEFON PONOWNIE"; rebootReady = true; }
    return;
  }
  $("#install").disabled = true;
  $("#install").textContent = "INSTALUJĘ...";
  try {
    const result = await api.install({ serial: diagnosis.serial, options: {
      lockscreenBypass: $("#lockscreen").checked,
      doubleTapWake: $("#dt2w").checked,
      batteryGuard: $("#battery").checked,
      "endodeck-balanced": $("#balanced").checked,
      "endodeck-oem-huawei-ale-l21": $("#dt2w").checked || $("#battery").checked
    } });
    notify(`Zainstalowano profil ${result.profile.name}. Wymagany restart telefonu.`);
    $("#install").textContent = "URUCHOM TELEFON PONOWNIE";
    $("#install").disabled = false;
    rebootReady = true;
  } catch (error) { notify(error.message, true); $("#install").disabled = false; $("#install").textContent = "ZAINSTALUJ ZESTAW"; }
});

$("#studio").addEventListener("click", () => api.openStudio());
$("#data").addEventListener("click", () => api.openData());
$("#updates").addEventListener("click", async () => {
  const result = await api.checkUpdates();
  if (!result.ok) return notify(result.error, true);
  if (result.phone?.modulesPending && diagnosis?.serial && window.confirm(`Pobrano ${result.phone.modulesPending} aktualizacje modułów Magisk. Zainstalować je teraz? Po instalacji będzie wymagany restart telefonu.`)) {
    const installed = await api.installModuleUpdates(diagnosis.serial);
    return notify(`Zainstalowano ${installed.installed} moduły. Uruchom telefon ponownie.`);
  }
  notify(result.phone?.apkUpdated ? "APK telefonu zostało zaktualizowane i sprawdzone." : result.phone?.available ? `Dostępne wydanie ${result.phone.version}.` : "Brak nowszej aktualizacji.");
});
$("#autostart").addEventListener("change", (event) => api.setAutostart(event.target.checked));
api.getAutostart().then((state) => { $("#autostart").checked = state.openAtLogin; });
api.status().then(({ state }) => { if (state.serial) api.diagnose(state.serial).then(render).catch(() => {}); });
api.onUpdateStatus((state) => notify(state.error || state.message || "Stan aktualizacji zmieniony", Boolean(state.error)));
