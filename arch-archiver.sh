#!/bin/bash

# Переменные
SOURCE_DIR="./music"
BACKUP_PARENT="./backups"
# Генерируем имя файла с текущей датой и временем
DATE=$(date +%Y-%m-%d_%H-%M-%S)
ARCHIVE_NAME="music_backup_$DATE.tar.gz"

echo "=== Запуск резервного копирования ==="

# Проверяем, существует ли папка с музыкой
if [ -d "$SOURCE_DIR" ]; then
    # Создаем папку для архивов, если её нет
    mkdir -p "$BACKUP_PARENT"
    
    echo "Создаем сжатый архив: $ARCHIVE_NAME..."
    
    # tar -czf: c (create), z (gzip сжатие), f (file)
    tar -czf "$BACKUP_PARENT/$ARCHIVE_NAME" "$SOURCE_DIR"
    
    echo "✅ Успех! Архив сохранен в: $BACKUP_PARENT/$ARCHIVE_NAME"
    echo "Размер архива:"
    du -sh "$BACKUP_PARENT/$ARCHIVE_NAME" | awk '{print $1}'
else
    echo "❌ Ошибка: Папка $SOURCE_DIR не найдена!"
fi

