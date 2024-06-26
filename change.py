import os
import json
import shutil
from pathlib import Path

# Chemins des dossiers
revision_dir = 'public/Revision'
annales_dir = 'public/Annales'
output_json = 'data.json'

def rename_path(old_path):
    new_name = old_path.name.replace(' ', '_').replace(',', '').replace('-', '_').replace('–', '_').replace('—', '_').replace('\'', '').replace('’', '')
    new_path = old_path.parent / new_name
    old_path.rename(new_path)
    return new_path

def rename_file(old_path, new_dir):
    new_name = old_path.name.replace(' ', '_').replace(',', '').replace('-', '_').replace('–', '_').replace('—', '_').replace('\'', '').replace('’', '')
    new_path = new_dir / new_name
    shutil.move(old_path, new_path)
    return new_path.name

def process_directory(directory):
    data = {}
    base_dir = Path(directory)
    for matiere in base_dir.iterdir():
        if matiere.is_dir():
            original_matiere_name = matiere.name
            matiere = rename_path(matiere)
            data[matiere.name] = {'original': original_matiere_name, 'new': matiere.name, 'chapters': {}}
            for chapitre in matiere.iterdir():
                if chapitre.is_dir():
                    original_chapitre_name = chapitre.name
                    chapitre = rename_path(chapitre)
                    data[matiere.name]['chapters'][chapitre.name] = {'original': original_chapitre_name, 'new': chapitre.name, 'files': []}
                    for fiche in chapitre.iterdir():
                        if fiche.is_file():
                            original_fiche_name = fiche.name
                            new_name = rename_file(fiche, chapitre)
                            data[matiere.name]['chapters'][chapitre.name]['files'].append({
                                'original': original_fiche_name,
                                'new': new_name
                            })
    return data

def process_annales(directory):
    data = {}
    base_dir = Path(directory)
    for matiere in base_dir.iterdir():
        if matiere.is_dir():
            original_matiere_name = matiere.name
            matiere = rename_path(matiere)
            data[matiere.name] = {'original': original_matiere_name, 'new': matiere.name, 'files': []}
            for annee in matiere.iterdir():
                if annee.is_file():
                    original_annee_name = annee.name
                    new_name = rename_file(annee, matiere)
                    data[matiere.name]['files'].append({
                        'original': original_annee_name,
                        'new': new_name
                    })
    return data

if __name__ == '__main__':
    revisions = process_directory(revision_dir)
    annales = process_annales(annales_dir)

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump({
            'revisions': revisions,
            'annales': annales
        }, f, ensure_ascii=False, indent=4)

    print(f'Données sauvegardées dans {output_json}')
