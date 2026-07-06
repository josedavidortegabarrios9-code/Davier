/* ================================================================
   DAVIER — js/firestore-rest.js
   Habla con Firestore usando peticiones HTTPS normales (fetch),
   en vez del SDK de Firebase, que abre un canal especial tipo
   streaming que algunas redes/wifi bloquean o cuelgan sin avisar.
   ================================================================ */

const FirestoreREST = (() => {
  const PROJECT_ID = "davier-5c193";
  const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

  function withTimeout(promise, ms, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Tiempo de espera agotado (${label || "operación"}) después de ${ms / 1000}s. Revisa tu conexión a internet.`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  /* ---- Convertir JS -> formato Firestore ---- */
  function toValue(v) {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === "boolean") return { booleanValue: v };
    if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (typeof v === "string") return { stringValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
    if (typeof v === "object") return { mapValue: { fields: toFields(v) } };
    return { stringValue: String(v) };
  }

  function toFields(obj) {
    const fields = {};
    Object.keys(obj).forEach(k => { fields[k] = toValue(obj[k]); });
    return fields;
  }

  /* ---- Convertir formato Firestore -> JS ---- */
  function fromValue(v) {
    if (!v) return null;
    if ("nullValue" in v) return null;
    if ("booleanValue" in v) return v.booleanValue;
    if ("integerValue" in v) return parseInt(v.integerValue, 10);
    if ("doubleValue" in v) return v.doubleValue;
    if ("stringValue" in v) return v.stringValue;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromValue);
    if ("mapValue" in v) return fromFields(v.mapValue.fields || {});
    return null;
  }

  function fromFields(fields) {
    const obj = {};
    Object.keys(fields || {}).forEach(k => { obj[k] = fromValue(fields[k]); });
    return obj;
  }

  async function authHeader() {
    if (typeof auth !== "undefined" && auth && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        return { "Authorization": "Bearer " + token };
      } catch (e) { /* sigue sin token */ }
    }
    return {};
  }

  /* ---- Leer un documento. Devuelve null si no existe. ---- */
  async function getDoc(path) {
    const headers = await authHeader();
    const res = await withTimeout(
      fetch(`${BASE}/${path}`, { headers }),
      12000, "leer " + path
    );
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`(${res.status}) ${body?.error?.message || res.statusText}`);
    }
    const json = await res.json();
    return fromFields(json.fields || {});
  }

  /* ---- Crear/sobrescribir un documento con ID fijo (como .set()) ---- */
  async function setDoc(path, data) {
    const headers = { ...(await authHeader()), "Content-Type": "application/json" };
    const res = await withTimeout(
      fetch(`${BASE}/${path}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ fields: toFields(data) })
      }),
      12000, "guardar " + path
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`(${res.status}) ${body?.error?.message || res.statusText}`);
    }
    return true;
  }

  /* ---- Crear un documento nuevo con ID automático (como .add()) ---- */
  async function addDoc(collectionPath, data) {
    const headers = { ...(await authHeader()), "Content-Type": "application/json" };
    const res = await withTimeout(
      fetch(`${BASE}/${collectionPath}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ fields: toFields(data) })
      }),
      12000, "crear pedido"
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`(${res.status}) ${body?.error?.message || res.statusText}`);
    }
    const json = await res.json();
    const id = (json.name || "").split("/").pop();
    return id;
  }

  /* ---- Actualizar solo un campo de un documento ---- */
  async function updateField(path, fieldName, value) {
    const headers = { ...(await authHeader()), "Content-Type": "application/json" };
    const res = await withTimeout(
      fetch(`${BASE}/${path}?updateMask.fieldPaths=${encodeURIComponent(fieldName)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ fields: toFields({ [fieldName]: value }) })
      }),
      12000, "actualizar " + path
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`(${res.status}) ${body?.error?.message || res.statusText}`);
    }
    return true;
  }

  /* ---- Listar todos los documentos de una colección ---- */
  async function listCollection(collectionPath) {
    const headers = await authHeader();
    const res = await withTimeout(
      fetch(`${BASE}/${collectionPath}?pageSize=200`, { headers }),
      12000, "listar " + collectionPath
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`(${res.status}) ${body?.error?.message || res.statusText}`);
    }
    const json = await res.json();
    return (json.documents || []).map(doc => ({
      id: doc.name.split("/").pop(),
      data: fromFields(doc.fields || {})
    }));
  }

  return { getDoc, setDoc, addDoc, updateField, listCollection };
})();
