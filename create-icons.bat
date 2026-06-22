@echo off
REM Создание простых placeholder иконок для PWA на Windows

echo.
echo 🎨 Создание иконок для PWA...
echo.

REM Проверяем наличие папки icons
if not exist "public\icons" (
    mkdir public\icons
    echo ✅ Создана папка public\icons
)

REM Создаем простые PNG файлы (1x1 синий квадрат как placeholder)
REM Это временное решение до загрузки реальных иконок

echo.
echo 📝 Создание placeholder иконок...
echo.

REM На Windows можно использовать Python для создания PNG
python -c "from PIL import Image; Image.new('RGB', (192, 192), '#3498db').save('public/icons/icon-192x192.png')" 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Python с PIL не найден
    echo.
    echo 📖 Способ 1: Установить Python
    echo    pip install Pillow
    echo    Затем запустить этот скрипт заново
    echo.
    echo 📖 Способ 2: Использовать онлайн генератор (РЕКОМЕНДУЕТСЯ)
    echo    1. Перейди на https://realfavicongenerator.net/
    echo    2. Загрузи изображение или эмодзи
    echo    3. Скачай иконки
    echo    4. Распакуй в папку public/icons/
    echo.
    echo 📖 Способ 3: Копировать готовые иконки вручную
    echo    Скопируй PNG файлы в: public/icons/
    echo    Нужны:
    echo      - icon-192x192.png
    echo      - icon-192x192-maskable.png
    echo      - icon-512x512.png
    echo      - icon-512x512-maskable.png
    echo.
    goto end
)

python -c "from PIL import Image; Image.new('RGB', (192, 192), '#3498db').save('public/icons/icon-192x192-maskable.png')"
python -c "from PIL import Image; Image.new('RGB', (512, 512), '#3498db').save('public/icons/icon-512x512.png')"
python -c "from PIL import Image; Image.new('RGB', (512, 512), '#3498db').save('public/icons/icon-512x512-maskable.png')"

echo ✅ Иконки созданы:
echo    - icon-192x192.png
echo    - icon-192x192-maskable.png
echo    - icon-512x512.png
echo    - icon-512x512-maskable.png
echo.
echo ⚠️  ВАЖНО: Это временные placeholder иконки!
echo.
echo 📖 Для красивого приложения загрузи реальные иконки:
echo    1. Перейди на https://realfavicongenerator.net/
echo    2. Загрузи логотип или эмодзи
echo    3. Скачай иконки
echo    4. Заменить файлы в папке public/icons/
echo.

:end
echo.
echo 🚀 PWA готова к установке!
echo.
pause
