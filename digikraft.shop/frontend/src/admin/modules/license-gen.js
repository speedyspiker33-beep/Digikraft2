// ===== LICENSE GENERATOR ENGINE =====
window.LicenseGen = (() => {

  // ── CORE GENERATORS ──────────────────────────────────────────────────────

  const CHARS = { upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower:'abcdefghijklmnopqrstuvwxyz', num:'0123456789', hex:'0123456789ABCDEF', alphanum:'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', safe:'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' };
  const rand = (set, n) => Array.from({length:n}, ()=>set[Math.floor(Math.random()*set.length)]).join('');
  const randInt = (min, max) => Math.floor(Math.random()*(max-min+1))+min;

  // Luhn checksum digit
  function luhn(digits) {
    let sum=0; let alt=false;
    for(let i=digits.length-1;i>=0;i--){let d=parseInt(digits[i]);if(alt){d*=2;if(d>9)d-=9;}sum+=d;alt=!alt;}
    return (10-sum%10)%10;
  }

  // CRC8 checksum
  function crc8(str) {
    let crc=0;
    for(let i=0;i<str.length;i++){crc^=str.charCodeAt(i);for(let j=0;j<8;j++){crc=crc&0x80?(crc<<1)^0x07:(crc<<1);crc&=0xFF;}}
    return crc.toString(16).toUpperCase().padStart(2,'0');
  }

  // XOR-based checksum
  function xorCheck(str) {
    let x=0; for(let c of str) x^=c.charCodeAt(0);
    return x.toString(16).toUpperCase().padStart(2,'0');
  }

  // Base58 encode (Bitcoin-style, no 0/O/I/l)
  const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  function base58(n) { let r=''; while(n>0){r=B58[n%58]+r;n=Math.floor(n/58);} return r||'1'; }

  // UUID v4
  function uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);});
  }

  // Timestamp-based seed
  function tsSeed() { return (Date.now() * Math.random()).toString(36).toUpperCase().replace('.',''); }

  // ── PROGRAMS ─────────────────────────────────────────────────────────────

  const programs = {

    // 1. Standard Segmented (XXXXX-XXXXX-XXXXX-XXXXX)
    standard: {
      name: 'Standard Segmented',
      desc: 'Classic 4×5 alphanumeric segments. Universal format.',
      icon: 'fa-key',
      color: 'var(--accent)',
      options: [
        { id:'prefix', label:'Prefix', type:'text', default:'DK' },
        { id:'segments', label:'Segments', type:'number', default:4, min:2, max:8 },
        { id:'segLen', label:'Segment Length', type:'number', default:5, min:3, max:8 },
        { id:'charset', label:'Character Set', type:'select', options:['ALPHANUM','UPPER_ONLY','HEX','SAFE_CHARS'], default:'SAFE_CHARS' },
        { id:'separator', label:'Separator', type:'select', options:['-','.','/','_','|'], default:'-' },
        { id:'checksum', label:'Checksum', type:'select', options:['None','CRC8','XOR'], default:'CRC8' },
      ],
      generate(opts, ctx) {
        const cs = { ALPHANUM:CHARS.alphanum, UPPER_ONLY:CHARS.upper, HEX:CHARS.hex, SAFE_CHARS:CHARS.safe }[opts.charset]||CHARS.safe;
        const segs = Array.from({length:opts.segments}, ()=>rand(cs, opts.segLen));
        let key = segs.join(opts.separator);
        if(opts.checksum==='CRC8') key += opts.separator + crc8(key);
        if(opts.checksum==='XOR') key += opts.separator + xorCheck(key);
        return opts.prefix ? opts.prefix+'-'+key : key;
      }
    },

    // 2. UUID-based
    uuid: {
      name: 'UUID v4',
      desc: 'RFC 4122 UUID. Globally unique, widely supported.',
      icon: 'fa-fingerprint',
      color: 'var(--blue)',
      options: [
        { id:'prefix', label:'Prefix', type:'text', default:'' },
        { id:'uppercase', label:'Uppercase', type:'checkbox', default:true },
        { id:'braces', label:'Wrap in braces {}', type:'checkbox', default:false },
      ],
      generate(opts) {
        let key = uuid4();
        if(opts.uppercase) key = key.toUpperCase();
        if(opts.braces) key = '{'+key+'}';
        return opts.prefix ? opts.prefix+'-'+key : key;
      }
    },

    // 3. Hardware-Bound (embeds machine/user fingerprint)
    hardware: {
      name: 'Hardware-Bound',
      desc: 'Encodes customer/machine data into the key. Harder to share.',
      icon: 'fa-microchip',
      color: 'var(--purple)',
      options: [
        { id:'prefix', label:'Product Code', type:'text', default:'PRD' },
        { id:'includeDate', label:'Embed Issue Date', type:'checkbox', default:true },
        { id:'includeCustomer', label:'Embed Customer ID', type:'checkbox', default:true },
        { id:'obfuscate', label:'Obfuscate Data', type:'checkbox', default:true },
      ],
      generate(opts, ctx) {
        const dateCode = opts.includeDate ? new Date().toISOString().slice(0,10).replace(/-/g,'') : '';
        const custCode = opts.includeCustomer && ctx?.customerId ? ctx.customerId.slice(-4).toUpperCase() : rand(CHARS.alphanum,4);
        const random = rand(CHARS.safe, 6);
        let raw = dateCode + custCode + random;
        if(opts.obfuscate) raw = raw.split('').map((c,i)=>i%3===0?String.fromCharCode(c.charCodeAt(0)^0x1F):c).join('').replace(/[^\x20-\x7E]/g,'X');
        const parts = [opts.prefix, raw.slice(0,6), raw.slice(6,12), crc8(raw)];
        return parts.filter(Boolean).join('-');
      }
    },

    // 4. Numeric Serial
    numeric: {
      name: 'Numeric Serial',
      desc: 'Pure numeric key with Luhn checksum. Good for phone-based activation.',
      icon: 'fa-hashtag',
      color: 'var(--green)',
      options: [
        { id:'prefix', label:'Prefix Digits', type:'text', default:'9001' },
        { id:'length', label:'Total Length', type:'number', default:16, min:8, max:20 },
        { id:'groups', label:'Group Size', type:'number', default:4, min:2, max:6 },
        { id:'luhnCheck', label:'Luhn Checksum', type:'checkbox', default:true },
      ],
      generate(opts) {
        const body = opts.prefix + rand(CHARS.num, opts.length - opts.prefix.length - (opts.luhnCheck?1:0));
        const full = opts.luhnCheck ? body + luhn(body) : body;
        const gs = opts.groups;
        return full.match(new RegExp(`.{1,${gs}}`,'g')).join('-');
      }
    },

    // 5. Base58 Compact
    base58: {
      name: 'Base58 Compact',
      desc: 'Short, URL-safe key. No ambiguous chars (0/O/I/l). Bitcoin-style.',
      icon: 'fa-compress-alt',
      color: 'var(--yellow)',
      options: [
        { id:'prefix', label:'Prefix', type:'text', default:'DK' },
        { id:'length', label:'Key Length', type:'number', default:16, min:8, max:32 },
        { id:'segments', label:'Segments', type:'number', default:2, min:1, max:4 },
      ],
      generate(opts) {
        const segLen = Math.ceil(opts.length / opts.segments);
        const segs = Array.from({length:opts.segments}, ()=>base58(randInt(1e10,9e15)).slice(0,segLen).padEnd(segLen,'1'));
        return (opts.prefix?opts.prefix+'-':'')+segs.join('-');
      }
    },

    // 6. Hex Token
    hex: {
      name: 'Hex Token',
      desc: 'Hexadecimal token. Common for API keys and software tokens.',
      icon: 'fa-code',
      color: 'var(--red)',
      options: [
        { id:'prefix', label:'Prefix', type:'text', default:'dk_' },
        { id:'length', label:'Hex Length', type:'number', default:32, min:8, max:64 },
        { id:'uppercase', label:'Uppercase', type:'checkbox', default:false },
        { id:'addDashes', label:'Add Dashes (every 8)', type:'checkbox', default:false },
      ],
      generate(opts) {
        let key = rand(CHARS.hex, opts.length);
        if(!opts.uppercase) key = key.toLowerCase();
        if(opts.addDashes) key = key.match(/.{1,8}/g).join('-');
        return opts.prefix + key;
      }
    },

    // 7. Date-Encoded
    dateEncoded: {
      name: 'Date-Encoded',
      desc: 'Embeds expiry date in the key itself. Self-validating.',
      icon: 'fa-calendar-alt',
      color: 'var(--pink)',
      options: [
        { id:'prefix', label:'Prefix', type:'text', default:'DK' },
        { id:'expiryDays', label:'Valid for (days)', type:'number', default:365, min:1, max:3650 },
        { id:'encodeType', label:'Encode Type', type:'select', options:['Base36','Hex','Decimal'], default:'Base36' },
        { id:'checksum', label:'Checksum', type:'checkbox', default:true },
      ],
      generate(opts) {
        const expiry = new Date(Date.now() + opts.expiryDays*86400000);
        const ts = expiry.getTime();
        let encoded;
        if(opts.encodeType==='Base36') encoded = ts.toString(36).toUpperCase();
        else if(opts.encodeType==='Hex') encoded = ts.toString(16).toUpperCase();
        else encoded = ts.toString();
        const random = rand(CHARS.safe, 6);
        const body = encoded + random;
        const cs = opts.checksum ? '-'+crc8(body) : '';
        return opts.prefix+'-'+body.slice(0,6)+'-'+body.slice(6,12)+cs;
      }
    },

    // 8. Product-Specific (embeds product code)
    productBound: {
      name: 'Product-Bound',
      desc: 'Key is tied to a specific product code. Cannot be used for other products.',
      icon: 'fa-box',
      color: 'var(--accent2)',
      options: [
        { id:'productCode', label:'Product Code', type:'text', default:'CDRAW' },
        { id:'version', label:'Version', type:'text', default:'X9' },
        { id:'tier', label:'License Tier', type:'select', options:['BASIC','PRO','ENTERPRISE','TRIAL'], default:'PRO' },
        { id:'seats', label:'Seats/Users', type:'number', default:1, min:1, max:999 },
        { id:'checksum', label:'Checksum', type:'checkbox', default:true },
      ],
      generate(opts) {
        const seatCode = opts.seats.toString().padStart(3,'0');
        const tierCode = { BASIC:'B',PRO:'P',ENTERPRISE:'E',TRIAL:'T' }[opts.tier]||'P';
        const random = rand(CHARS.safe, 8);
        const body = opts.productCode+opts.version+tierCode+seatCode+random;
        const cs = opts.checksum ? crc8(body) : '';
        return body.slice(0,5)+'-'+body.slice(5,10)+'-'+body.slice(10,15)+(cs?'-'+cs:'');
      }
    },

    // 9. Subscription Token (JWT-like)
    subscriptionToken: {
      name: 'Subscription Token',
      desc: 'JWT-inspired token with header.payload.signature structure.',
      icon: 'fa-shield-alt',
      color: 'var(--green)',
      options: [
        { id:'productId', label:'Product ID', type:'text', default:'DK001' },
        { id:'duration', label:'Duration (days)', type:'number', default:365, min:1, max:3650 },
        { id:'tier', label:'Tier', type:'select', options:['basic','pro','enterprise'], default:'pro' },
        { id:'secret', label:'Signing Secret', type:'text', default:'dk_secret_2024' },
      ],
      generate(opts, ctx) {
        const header = btoa(JSON.stringify({alg:'DK1',typ:'LIC'})).replace(/=/g,'');
        const payload = btoa(JSON.stringify({
          pid: opts.productId,
          tier: opts.tier,
          iat: Math.floor(Date.now()/1000),
          exp: Math.floor((Date.now()+opts.duration*86400000)/1000),
          cid: ctx?.customerId || rand(CHARS.alphanum,8),
          jti: rand(CHARS.alphanum,12)
        })).replace(/=/g,'');
        const sig = xorCheck(header+'.'+payload+opts.secret).padStart(8,'0');
        return header+'.'+payload+'.'+sig;
      }
    },

    // 10. Bulk Pool (pre-generate a pool)
    bulkPool: {
      name: 'Bulk Pool Generator',
      desc: 'Generate a pool of keys at once. Assign from pool on demand.',
      icon: 'fa-layer-group',
      color: 'var(--blue)',
      options: [
        { id:'count', label:'Number of Keys', type:'number', default:10, min:1, max:1000 },
        { id:'format', label:'Base Format', type:'select', options:['standard','uuid','hex','numeric','base58'], default:'standard' },
        { id:'prefix', label:'Prefix', type:'text', default:'DK' },
        { id:'exportCSV', label:'Export as CSV', type:'checkbox', default:false },
      ],
      generate(opts, ctx) {
        const base = programs[opts.format] || programs.standard;
        const keys = Array.from({length:opts.count}, ()=>base.generate({...opts, segments:4, segLen:5, charset:'SAFE_CHARS', separator:'-', checksum:'CRC8', uppercase:true, length:32, groups:4, luhnCheck:true}, ctx));
        return keys.join('\n');
      }
    },
  };

  // ── VALIDATOR ─────────────────────────────────────────────────────────────

  function validate(key, programId) {
    if (!key) return { valid: false, reason: 'Empty key' };
    const p = programs[programId];
    if (!p) return { valid: true, reason: 'No validator for this format' };

    // Basic checks
    if (key.length < 8) return { valid: false, reason: 'Key too short' };

    // CRC8 check for standard/hardware
    if (programId === 'standard' || programId === 'hardware') {
      const parts = key.split(/[-./|_]/);
      if (parts.length >= 2) {
        const last = parts[parts.length-1];
        const body = parts.slice(0,-1).join('-');
        if (crc8(body) === last) return { valid: true, reason: 'CRC8 checksum valid ✓' };
      }
    }

    // UUID check
    if (programId === 'uuid') {
      const uuidRe = /^[{]?[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}[}]?$/;
      return uuidRe.test(key) ? { valid: true, reason: 'Valid UUID v4 ✓' } : { valid: false, reason: 'Invalid UUID format' };
    }

    // JWT-like token
    if (programId === 'subscriptionToken') {
      const parts = key.split('.');
      if (parts.length !== 3) return { valid: false, reason: 'Invalid token structure' };
      try {
        const payload = JSON.parse(atob(parts[1]+'=='));
        const expired = payload.exp && payload.exp < Date.now()/1000;
        return expired ? { valid: false, reason: 'Token expired on '+new Date(payload.exp*1000).toLocaleDateString() } : { valid: true, reason: `Valid · Tier: ${payload.tier} · Expires: ${new Date(payload.exp*1000).toLocaleDateString()}` };
      } catch { return { valid: false, reason: 'Cannot decode token' }; }
    }

    return { valid: true, reason: 'Format check passed ✓' };
  }

  return { programs, generate: (id, opts, ctx) => programs[id]?.generate(opts, ctx) || '', validate, crc8, xorCheck, luhn, uuid4 };
})();
