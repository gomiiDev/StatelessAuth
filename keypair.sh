#!/bin/bash

# Generar llave privada RSA 2048 en formato PKCS#8
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem

# Extraer llave pública
openssl pkey -in private.pem -pubout -out public.pem

echo "Llaves generadas exitosamente: private.pem y public.pem"
