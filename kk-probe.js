// KoffyKraft (C) 2026 T M Thomas. AGPL-3.0 with additional terms (attribution, names): see NOTICE.
// Live probe readings for the Timer. Three ways in, picked from a list:
//  1. USB, one number per line: any Arduino or logger that prints the temperature in °C on each line.
//  2. USB, TC4 / Artisan: boards running the aArtisan sketch; we send CHAN, UNITS;C, then READ each
//     second and take the channels after ambient.
//  3. Bluetooth, standard thermometer: devices that use the Bluetooth Health Thermometer (0x1809)
//     or Environmental Sensing (0x181A) services. Many branded kitchen probes use their own
//     protocols and will not show up here.
// USB needs Chrome or Edge on a computer (Web Serial). Bluetooth needs Chrome on Android or a
// computer (Web Bluetooth). Neither works on iPhone; typing readings always works.
(function () {
  if (window.KKPROBE) return;
  const MODES = [
    ['manual', 'Type readings (no probe)'],
    ['serial-line', 'USB: one number per line (Arduino, logger)'],
    ['serial-tc4', 'USB: TC4 / Artisan board'],
    ['ble', 'Bluetooth: standard thermometer'],
  ];
  const can = m =>
    m === 'manual' ||
    (m.startsWith('serial') && 'serial' in navigator) ||
    (m === 'ble' && 'bluetooth' in navigator);

  // first number in a text line, or all numbers for TC4 replies
  const nums = line => (line.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  // IEEE 11073 32-bit float, used by the Health Thermometer measurement
  function ieeeFloat(dv, o) {
    const raw = dv.getUint32(o, true),
      mant = raw & 0xffffff,
      exp = ((raw >> 24) << 24) >> 24;
    const m = mant & 0x800000 ? mant - 0x1000000 : mant;
    return m * Math.pow(10, exp);
  }
  // Health Thermometer measurement: flags byte, then the float; bit 0 set means °F
  function parseHT(dv) {
    const f = dv.getUint8(0),
      v = ieeeFloat(dv, 1);
    return f & 1 ? ((v - 32) * 5) / 9 : v;
  }
  // Environmental Sensing temperature: signed 16-bit, hundredths of °C
  const parseES = dv => dv.getInt16(0, true) / 100;

  function mount(box, opts) {
    const onTemp = opts.onTemp || (() => {});
    let mode = 'manual',
      port = null,
      reader = null,
      gatt = null,
      poll = null,
      stopFlag = false;
    try {
      mode = localStorage.getItem('kk_probe_mode') || 'manual';
    } catch (e) {}
    box.innerHTML =
      '<details class="kkp"><summary>Probe: <span id="kkpSum"></span></summary><label>Connection<select id="kkpMode">' +
      MODES.map(
        ([k, l]) =>
          '<option value="' +
          k +
          '"' +
          (k === mode ? ' selected' : '') +
          (can(k) ? '' : ' disabled') +
          '>' +
          l +
          (can(k) ? '' : ' (not on this browser)') +
          '</option>'
      ).join('') +
      '</select></label><div class="kkp-row" id="kkpRow"><select id="kkpCh" aria-label="Which channel is which"><option value="et">Ch 1 ET, Ch 2 BT</option><option value="bt">Ch 1 BT, Ch 2 ET</option></select>' +
      '<select id="kkpEvery" aria-label="Record every"><option value="5">Every 5 s</option><option value="10" selected>Every 10 s</option><option value="15">Every 15 s</option><option value="30">Every 30 s</option></select>' +
      '<button type="button" class="btn secondary" id="kkpGo">Connect</button></div></details><div class="kkp-live" id="kkpLive"></div>';
    const $ = id => box.querySelector('#' + id);
    const st = document.createElement('style');
    st.textContent =
      '.kkp{margin:10px 0 4px}.kkp summary{font-size:13px;color:#77716a;cursor:pointer;padding:6px 0;min-height:32px}.kkp summary span{color:#171512;font-weight:600}.kkp label{margin-top:6px}.kkp label{display:flex;flex-direction:column;gap:4px;font-size:13px;color:#77716a}.kkp-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.kkp-row select{flex:1;min-width:140px}#kkpCh{flex-basis:100%}.kkp-live{font-size:13px;color:#77716a;margin-top:6px}.kkp-live b{color:#171512;font-size:16px}';
    box.appendChild(st);
    const show = () => {
      const m = $('kkpMode').value;
      $('kkpSum').textContent =
        (MODES.find(x => x[0] === m) || MODES[0])[1] + (port || gatt ? ', connected' : '');
      $('kkpRow').style.display = m === 'manual' ? 'none' : 'flex';
      $('kkpCh').style.display = m === 'serial-tc4' ? '' : 'none';
    };
    show();
    const live = t => ($('kkpLive').innerHTML = t);
    const channels = vals => {
      // vals: probe readings in °C in channel order
      const swap = $('kkpCh').value === 'bt';
      const out = {};
      if (vals[0] != null) out[swap ? 'bean' : 'exhaust'] = vals[0];
      if (vals[1] != null) out[swap ? 'exhaust' : 'bean'] = vals[1];
      return out;
    };
    const feed = (vals, single) => {
      const ok = vals.filter(v => Number.isFinite(v) && v > -50 && v < 600);
      if (!ok.length) return;
      const by = single ? { any: ok[0] } : channels(ok);
      live(
        'Live: ' +
          Object.entries(by)
            .map(
              ([k, v]) =>
                (k === 'any' ? '' : k === 'exhaust' ? 'ET ' : 'BT ') + '<b>' + v.toFixed(1) + ' °C</b>'
            )
            .join(' · ')
      );
      onTemp(by);
    };
    async function stop() {
      stopFlag = true;
      clearInterval(poll);
      poll = null;
      try {
        reader && (await reader.cancel());
      } catch (e) {}
      try {
        port && (await port.close());
      } catch (e) {}
      try {
        gatt && gatt.connected && gatt.disconnect();
      } catch (e) {}
      port = reader = gatt = null;
      $('kkpGo').textContent = 'Connect';
      live('Disconnected.');
      show();
      opts.onState && opts.onState(false);
    }
    async function serial(tc4) {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      stopFlag = false;
      const enc = new TextEncoder();
      const send = async s => {
        const w = port.writable.getWriter();
        await w.write(enc.encode(s + '\n'));
        w.releaseLock();
      };
      if (tc4) {
        await send('CHAN;1200');
        await send('UNITS;C');
        poll = setInterval(() => send('READ').catch(() => {}), 1000);
      }
      const dec = new TextDecoderStream();
      port.readable.pipeTo(dec.writable).catch(() => {});
      reader = dec.readable.getReader();
      let buf = '';
      (async () => {
        while (!stopFlag) {
          const { value, done } = await reader.read().catch(() => ({ done: true }));
          if (done) break;
          buf += value;
          let i;
          while ((i = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, i).trim();
            buf = buf.slice(i + 1);
            if (!line || /[a-df-z]/i.test(line.replace(/e[-+]?\d/gi, ''))) continue; // skip text replies
            const n = nums(line);
            if (tc4)
              feed(n.slice(1), false); // ambient comes first
            else feed(n.slice(0, 1), true);
          }
        }
      })();
    }
    async function ble() {
      const dev = await navigator.bluetooth.requestDevice({
        filters: [{ services: [0x1809] }, { services: [0x181a] }],
      });
      gatt = await dev.gatt.connect();
      dev.addEventListener('gattserverdisconnected', () => live('Bluetooth probe disconnected.'));
      let ch, parse;
      try {
        ch = await (await gatt.getPrimaryService(0x1809)).getCharacteristic(0x2a1c);
        parse = parseHT;
      } catch (e) {
        ch = await (await gatt.getPrimaryService(0x181a)).getCharacteristic(0x2a6e);
        parse = parseES;
      }
      ch.addEventListener('characteristicvaluechanged', e => feed([parse(e.target.value)], true));
      await ch.startNotifications();
    }
    $('kkpMode').onchange = () => {
      try {
        localStorage.setItem('kk_probe_mode', $('kkpMode').value);
      } catch (e) {}
      if (port || gatt) stop();
      show();
    };
    $('kkpGo').onclick = async () => {
      if (port || gatt) return stop();
      const m = $('kkpMode').value;
      try {
        live('Connecting…');
        if (m === 'ble') await ble();
        else await serial(m === 'serial-tc4');
        $('kkpGo').textContent = 'Disconnect';
        show();
        live('Connected. Waiting for a reading…');
        opts.onState && opts.onState(true);
      } catch (e) {
        live('Could not connect: ' + (e && e.message ? e.message : e));
        port = gatt = null;
      }
    };
    return { every: () => Number($('kkpEvery').value) || 10, stop };
  }
  window.KKPROBE = { mount, parseHT, parseES, ieeeFloat, nums, MODES };
})();
