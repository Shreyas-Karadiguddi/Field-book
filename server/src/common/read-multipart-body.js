export async function readMultipartOrBody(req, jsonFields = []) {
  if (!req.isMultipart || !req.isMultipart()) {
    return { fields: req.body, photoBuffer: undefined };
  }

  const fields = {};
  let photoBuffer;

  for await (const part of req.parts()) {
    if (part.file) {
      photoBuffer = await part.toBuffer();
    } else if (jsonFields.includes(part.fieldname)) {
      try {
        fields[part.fieldname] = JSON.parse(part.value);
      } catch {
        fields[part.fieldname] = part.value;
      }
    } else {
      fields[part.fieldname] = part.value;
    }
  }

  return { fields, photoBuffer };
}
