"""Restaura os três módulos alterados, sem tocar em saves ou inventário."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
for name in ['app.js','bitpoly-art.js','bitpoly-motion.js']:
 shutil.copy2(root/'reference'/name,root/'dist'/name)
shutil.copy2(root/'reference/lamb.png',root/'dist/assets/bitpoly/lamb.png')
print('V118 restaurada. Dados do jogador não foram alterados.')
