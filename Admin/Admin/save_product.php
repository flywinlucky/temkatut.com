<?php
// Setăm tipul de conținut la JSON
header('Content-Type: application/json');

// Citim datele trimise prin POST
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Verificăm dacă datele primite sunt valide
if ($data !== null) {
    // Calea către fișierul JSON unde stocăm produsele
    $filePath = 'json/products.json';

    // Citim produsele existente
    $existingProducts = json_decode(file_get_contents($filePath), true);

    // Actualizăm produsele existente cu noile date
    foreach ($data as &$newProduct) {
        foreach ($existingProducts as &$existingProduct) {
            if ((string)$newProduct['id'] === (string)$existingProduct['id']) {
                // Preservăm categoria existentă dacă nu este setată în noile date
                if (!isset($newProduct['category']) || $newProduct['category'] === "") {
                    $newProduct['category'] = $existingProduct['category'];
                }
                break;
            }
        }
    }

    // Salvăm datele în fișierul JSON cu opțiuni de formatare
    if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))) {
        // Răspuns de succes
        echo json_encode([
            "status" => "success",
            "message" => "Produsele au fost actualizate cu succes!"
        ]);
    } else {
        // Răspuns în caz de eroare la scrierea fișierului
        echo json_encode([
            "status" => "error",
            "message" => "Eroare la salvarea fișierului."
        ]);
    }
} else {
    // Răspuns în caz de date invalide
    echo json_encode([
        "status" => "error",
        "message" => "Datele trimise sunt invalide."
    ]);
}
?>
