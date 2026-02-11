import json
import sys

input_file = 'spaceless_webhook.json'
output_file = 'spaceless_fixed_final.json'

with open(input_file, 'r') as f:
    d = json.load(f)

# Wrapper code text for ValidateExtractImage1
validate_code = r"""// Validate and extract uploaded file
const formData = $input.item.json;
const binaryData = $input.item.binary;

let fileData = null;
let base64Data = '';
let mimeType = 'image/png';
let fileName = 'file.png';

if (binaryData) {
  const binaryKey = Object.keys(binaryData).find(key => 
    key.toLowerCase().includes('floor') || 
    key.toLowerCase().includes('image') ||
    key === 'data' ||
    key === 'file'
  ) || Object.keys(binaryData)[0];
  
  if (binaryKey && binaryData[binaryKey]) {
    base64Data = binaryData[binaryKey].data;
    mimeType = binaryData[binaryKey].mimeType || 'image/png';
    fileName = binaryData[binaryKey].fileName || fileName;
  }
}

// Fallback for octet-stream
if (mimeType === 'application/octet-stream') {
   const ext = (fileName || '').split('.').pop().toLowerCase();
   if (['png','jpg','jpeg','webp'].includes(ext)) {
       if (ext === 'png') mimeType = 'image/png';
       if (ext === 'webp') mimeType = 'image/webp';
       if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
   }
}

if (!base64Data && formData['Floor Plan Image']) {
  const field = formData['Floor Plan Image'];
  if (typeof field === 'string') {
    base64Data = field;
  } else if (field.data) {
    base64Data = field.data;
    mimeType = field.mimeType || mimeType;
  }
}

if (!base64Data && formData.file_0) {
  base64Data = formData.file_0.data || formData.file_0;
  mimeType = formData.file_0.mimeType || mimeType;
}

if (!base64Data) {
  throw new Error('No floor plan image found.');
}

const validTypes = ['png', 'jpeg', 'jpg', 'webp'];
if (!validTypes.some(t => mimeType.includes(t))) {
  throw new Error('Invalid file type: ' + mimeType);
}

// Extract style preference
const style = formData['Property Style'] || 'Modern';
const styleDescriptors = {
  'Modern': 'modern contemporary design with clean lines, neutral colors, and minimalist furniture',
  'Traditional': 'traditional classic design with warm wood tones, ornate details, and elegant furniture',
  'Minimalist': 'ultra-minimalist design with sparse furniture, white walls, and essential items only',
  'Industrial': 'industrial loft style with exposed brick, metal fixtures, and raw materials',
  'Scandinavian': 'Scandinavian design with light wood, cozy textiles, and hygge atmosphere'
};

return {
  json: {
    floorPlanBase64: base64Data,
    floorPlanMimeType: mimeType,
    email: formData['Email'],
    style: style,
    styleDescription: styleDescriptors[style],
    timestamp: new Date().toISOString()
  }
};"""

# Wrapper code text for Collect All URLs1
collect_code = r"""// Collect and Map Video URLs
const allItems = $('CollectRoomVideoURL1').all();
const videoUrls = [];
let kitchenUrl = null;
let bedroomUrl = null;
let patioUrl = null;
let mainVideoUrl = null;

for (const item of allItems) {
    const url = item.json.videoUrl;
    const name = (item.json.roomName || '').toLowerCase();
    
    if (url && typeof url === 'string' && url.length > 5) {
        videoUrls.push(url);
        if (!mainVideoUrl) mainVideoUrl = url;
        
        if (!kitchenUrl && name.includes('kitchen')) kitchenUrl = url;
        if (!bedroomUrl && (name.includes('bedroom') || name.includes('master'))) bedroomUrl = url;
        if (!patioUrl && (name.includes('patio') || name.includes('porch') || name.includes('exterior'))) patioUrl = url;
    }
}

if (videoUrls.length === 0) {
    // Graceful empty return
}

return {
  json: {
    video_urls: videoUrls,
    videoUrl: mainVideoUrl,
    kitchenVideoUrl: kitchenUrl,
    bedroomVideoUrl: bedroomUrl,
    patioVideoUrl: patioUrl
  }
};"""

# 1. Update Nodes
for node in d['nodes']:
    if node['name'] == 'ValidateExtractImage1':
        node['parameters']['jsCode'] = validate_code
    
    if node['name'] == 'WaitforAllVideos1':
        node['name'] = 'Collect All URLs1'
        node['parameters']['jsCode'] = collect_code

# 2. Update Connections
conn = d['connections']
if 'WaitforAllVideos1' in conn:
    conn['Collect All URLs1'] = conn.pop('WaitforAllVideos1')

# Update upstream connections TO this node
if 'LoopOverItems1' in conn:
    for output in conn['LoopOverItems1']['main']:
        for link in output:
            if link['node'] == 'WaitforAllVideos1':
                link['node'] = 'Collect All URLs1'

with open(output_file, 'w') as f:
    json.dump(d, f, indent=2)

print(f"Created {output_file}")
