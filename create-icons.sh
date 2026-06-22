#!/bin/bash
# Быстрая установка иконок PWA

echo "🎨 Создание базовых иконок для PWA..."

# Проверяем есть ли ImageMagick (convert команда)
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick не установлен"
    echo "📖 Используй realfavicongenerator.net для создания иконок"
    echo "   https://realfavicongenerator.net/"
    exit 1
fi

# Создаем временный файл с эмодзи
convert -background none -fill '#3498db' -pointsize 100 \
    label:'📊' /tmp/emoji.png 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Эмодзи иконка создана"
    
    # Резайзим в нужные размеры
    convert /tmp/emoji.png -resize 192x192 public/icons/icon-192x192.png
    convert /tmp/emoji.png -resize 512x512 public/icons/icon-512x512.png
    
    # Создаем копии для maskable
    cp public/icons/icon-192x192.png public/icons/icon-192x192-maskable.png
    cp public/icons/icon-512x512.png public/icons/icon-512x512-maskable.png
    
    echo "✅ Иконки созданы:"
    echo "   - icon-192x192.png"
    echo "   - icon-192x192-maskable.png"
    echo "   - icon-512x512.png"
    echo "   - icon-512x512-maskable.png"
    
    rm /tmp/emoji.png
else
    echo "❌ Ошибка при создании иконки"
    echo "📖 Используй realfavicongenerator.net"
fi
