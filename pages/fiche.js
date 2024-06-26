import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Fiche({ data }) {
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [selectedChapitre, setSelectedChapitre] = useState(null);
  const [selectedFiche, setSelectedFiche] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleMatiereSelect = (matiere) => {
    setSelectedMatiere(matiere);
    setSelectedChapitre(null);
    setSelectedFiche(null);
  };

  const handleChapitreSelect = (chapitre) => {
    setSelectedChapitre(chapitre);
    setSelectedFiche(null);
  };

  const handleFicheSelect = (fiche) => {
    setSelectedMatiere(fiche.matiereKey || selectedMatiere);
    setSelectedChapitre(fiche.chapitreKey || selectedChapitre);
    setSelectedFiche(fiche);
  };

  const handleBack = () => {
    if (selectedFiche) {
      setSelectedFiche(null);
    } else if (selectedChapitre) {
      setSelectedChapitre(null);
    } else if (selectedMatiere) {
      setSelectedMatiere(null);
    }
  };

  const filteredContent = () => {
    if (!selectedMatiere) return [];

    if (!selectedChapitre) {
      return Object.keys(data.revisions[selectedMatiere].chapters).filter(chapitre => 
        chapitre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return data.revisions[selectedMatiere].chapters[selectedChapitre].files.filter(fiche => 
        fiche.original.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };

  const isImage = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

  const isPDF = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return ext === 'pdf';
  };

  const allFiches = () => {
    let allFiches = [];
    Object.keys(data.revisions).forEach(matiere => {
      Object.keys(data.revisions[matiere].chapters).forEach(chapitre => {
        data.revisions[matiere].chapters[chapitre].files.forEach(fiche => {
          allFiches.push({
            ...fiche,
            matiere: data.revisions[matiere].original,
            chapitre: data.revisions[matiere].chapters[chapitre].original,
            matiereKey: matiere,
            chapitreKey: chapitre
          });
        });
      });
    });
    return allFiches.filter(fiche => fiche.original.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl mb-4 font-bold">Matières</h2>
      </CardHeader>
      <CardContent>
        {renderContent()}
        {!selectedMatiere && (
          <>
            <hr className="my-4"/>
            <div>
              <h2 className="text-2xl mb-4 font-bold">Toutes les fiches</h2>
              <Input 
                type="text" 
                placeholder="Rechercher une fiche..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFiches().map(fiche => (
                  <Card key={fiche.new} onClick={() => handleFicheSelect(fiche)}>
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-bold">{fiche.original.replace(/\.jpg|\.png/, '')}</h3>
                      <p><strong>Matière:</strong> {fiche.matiere}</p>
                      <p><strong>Chapitre:</strong> {fiche.chapitre}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  function renderContent() {
    if (selectedFiche) {
      return (
        <div>
          <Button onClick={handleBack} variant="outline" className="mb-4">Retour</Button>
          <div className="flex justify-center">
            {isImage(selectedFiche.new) ? (
              <img src={`/Revision/${encodeURIComponent(selectedMatiere)}/${encodeURIComponent(selectedChapitre)}/${encodeURIComponent(selectedFiche.new)}`} alt={selectedFiche.original} className="max-w-full h-auto" />
            ) : isPDF(selectedFiche.new) ? (
              <iframe src={`/Revision/${encodeURIComponent(selectedMatiere)}/${encodeURIComponent(selectedChapitre)}/${encodeURIComponent(selectedFiche.new)}`} className="w-full h-screen"></iframe>
            ) : (
              <p>Fichier non pris en charge : {selectedFiche.original}</p>
            )}
          </div>
        </div>
      );
    }

    if (!selectedMatiere) {
      return (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(data.revisions).map(matiere => (
              <Button key={matiere} onClick={() => handleMatiereSelect(matiere)} variant="outline">
                {data.revisions[matiere].original}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    if (!selectedChapitre) {
      return (
        <div>
          <Button onClick={handleBack} variant="outline" className="mb-4">Retour</Button>
          <h2 className="text-2xl mb-2">{data.revisions[selectedMatiere].original}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent().map(chapitre => (
              <Card key={chapitre} onClick={() => handleChapitreSelect(chapitre)}>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold">{data.revisions[selectedMatiere].chapters[chapitre].original}</h3>
                  <ul className="mt-2">
                    {data.revisions[selectedMatiere].chapters[chapitre].files.map(fiche => (
                      <li key={fiche.new}>{fiche.original.replace(/\.jpg|\.png/, '')}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div>
        <Button onClick={handleBack} variant="outline" className="mb-4">Retour</Button>
        <h2 className="text-2xl mb-2">{data.revisions[selectedMatiere].original} {selectedChapitre && `- ${data.revisions[selectedMatiere].chapters[selectedChapitre].original}`}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent().map(item => (
            <Card key={item.new} onClick={() => handleFicheSelect(item)}>
              <CardContent className="pt-6">
                <p>{item.original.replace(/\.jpg|\.png/, '')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
}
