const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

// 設定 Cloudinary（從環境變數讀取）
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(cors());
app.use(express.json());

// API 端點：取得所有照片
app.get('/api/images', async (req, res) => {
  try {
    let allResources = [];
    let nextCursor = null;
    let hasMore = true;
    
    while (hasMore) {
      const result = await cloudinary.api.resources({
        max_results: 100,
        next_cursor: nextCursor,
        resource_type: 'image'
      });
      
      allResources.push(...result.resources);
      nextCursor = result.next_cursor;
      hasMore = !!nextCursor;
    }
    
    const images = allResources.map(r => ({
      url: r.secure_url,
      time: r.created_at,
      public_id: r.public_id
    }));
    
    res.json({
      success: true,
      count: images.length,
      images: images
    });
    
  } catch (error) {
    console.error('Cloudinary API 錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: '請確認 Cloudinary API Key 設定正確'
    });
  }
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ API 服務已啟動，端口: ${PORT}`);
});
