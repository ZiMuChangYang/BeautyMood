<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $favorites = $_POST['favorites'] ?? '';
    file_put_contents('favorites.txt', $favorites);
    echo '更新成功';
} else {
    echo '无效请求';
}