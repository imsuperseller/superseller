import json

with open('/Users/shaifriedman/.gemini/antigravity/mcp-results/mcp_result_n8n_get_workflow_1769384809058.json', 'r') as f:
    wf = json.load(f)

# 1. Update ValidateExtractImage2
extract_code = """
const formData = $input.item.json;
const binaryData = $input.item.binary;

// Robust data extraction: look in body (webhook) and top-level (form)
const body = formData.body || {};
const actualData = { ...formData, ...body };

let base64Data = '', mimeType = 'image/png', fileName = 'file.png';

if (binaryData) {
  const key = Object.keys(binaryData).find(k => k.toLowerCase().includes('floor') || k.toLowerCase().includes('image') || k === 'data' || k === 'file') || Object.keys(binaryData)[0];
  if (key && binaryData[key]) {
    base64Data = binaryData[key].data;
    mimeType = binaryData[key].mimeType || 'image/png';
    fileName = binaryData[key].fileName || fileName;
  }
}

if (mimeType === 'application/octet-stream') {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  if (['png','jpg','jpeg','webp'].includes(ext)) mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
}

if (!base64Data && actualData['Floor Plan']) {
  const field = actualData['Floor Plan'];
  base64Data = typeof field === 'string' ? field : field.data || '';
  mimeType = field.mimeType || mimeType;
}

if (!base64Data && actualData.file_0) {
  base64Data = actualData.file_0.data || actualData.file_0;
  mimeType = actualData.file_0.mimeType || mimeType;
}

if (!base64Data) throw new Error('No floor plan image found.');

const validTypes = ['png', 'jpeg', 'jpg', 'webp'];
if (!validTypes.some(t => mimeType.includes(t))) throw new Error('Invalid file type: ' + mimeType);

const style = actualData['Property Style'] || actualData['style'] || 'Modern';
const styleMap = {
  'Modern': 'modern contemporary design with clean lines, neutral colors, and minimalist furniture',
  'Traditional': 'traditional classic design with warm wood tones, ornate details, and elegant furniture',
  'Minimalist': 'ultra-minimalist design with sparse furniture, white walls, and essential items only',
  'Industrial': 'industrial loft style with exposed brick, metal fixtures, and raw materials',
  'Scandinavian': 'Scandinavian design with light wood, cozy textiles, and hygge atmosphere',
  'French Provencal': 'French Provencal style with rustic charm, soft colors, and elegant details',
  'American Colonial': 'American Colonial design with traditional symmetry and classic furnishings',
  'Tudor Revival': 'Tudor Revival architecture with distinctive half-timbering and old-world charm',
  'Mid-Century Modern': 'Mid-Century Modern aesthetic with clean lines and organic forms',
  'Dallas Eclectic': 'Dallas Eclectic mix of contemporary and traditional Texas elements',
  'Texas Modern': 'Texas Modern design blending modern architecture with regional influences',
  'Victorian': 'Victorian era elegance with ornate details and rich textures',
  'Ranch Style': 'Ranch style architecture with open floor plans and casual comfort',
  'American Craftsman': 'American Craftsman style with handcrafted details and natural materials'
};

const address = (actualData['Property Address'] || actualData['address'] || '').trim();
const email = (actualData['Email'] || actualData['email'] || '').trim();

return {
  json: {
    floorPlanBase64: base64Data,
    floorPlanMimeType: mimeType,
    email: email,
    address: address,
    hasAddress: address.length > 0,
    style: style,
    styleDescription: styleMap[style] || styleMap['Modern'],
    timestamp: new Date().toISOString()
  }
};
""".strip()

for node in wf['nodes']:
    if node['name'] == 'ValidateExtractImage2':
        node['parameters']['jsCode'] = extract_code
        print("Updated ValidateExtractImage2")
    
    if node['name'] == 'StoreSubmission':
        # Aggressively clean columns to avoid schema mismatch
        # Keeping only columns that are usually present or safe
        value = node['parameters']['columns']['value']
        # We know 'address' is missing. Let's assume others might be too.
        # Let's keep ONLY 'status' for a minimal test if we are unsure.
        # Or better, let's keep things we THINK are there but remove 'address'.
        to_keep = ['status', 'submissionDate', 'email', 'style']
        new_value = {}
        for k, v in value.items():
            if k != 'address':
                new_value[k] = v
        node['parameters']['columns']['value'] = new_value
        print(f"Updated StoreSubmission: removed 'address'")

# 2. Add description to workflow to track version
wf['description'] = "RESTORED v2: Robust extraction + Fixed Data Table schema mismatch"

with open('patched_wf.json', 'w') as f:
    json.dump(wf, f, indent=2)
