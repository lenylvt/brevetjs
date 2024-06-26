import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Annales({ data }) {
  const [selectedMatiere, setSelectedMatiere] = useState(null);

  const handleMatiereSelect = (matiere) => {
    setSelectedMatiere(matiere);
  };

  const handleBack = () => {
    setSelectedMatiere(null);
  };

  const filteredContent = () => {
    if (!selectedMatiere) return [];

    return data.annales[selectedMatiere].files || [];
  };

  const isPDF = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return ext === 'pdf';
  };

  const getAnnee = (filename) => {
    const match = filename.match(/(\d{4})/);
    return match ? match[0] : 'Unknown';
  };

  const getFilesByYear = () => {
    const filesByYear = {};
    filteredContent().forEach(file => {
      const year = getAnnee(file.original);
      if (!filesByYear[year]) {
        filesByYear[year] = {};
      }
      if (file.original.toLowerCase().includes('corrig')) {
        filesByYear[year].corrige = file.new;
      } else {
        filesByYear[year].sujet = file.new;
      }
    });
    return filesByYear;
  };

  const getRandomSujet = () => {
    const files = filteredContent().filter(file => !file.original.toLowerCase().includes('corrig'));
    const randomFile = files[Math.floor(Math.random() * files.length)];
    window.open(`/Annales/${encodeURIComponent(selectedMatiere)}/${encodeURIComponent(randomFile.new)}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
      <h2 className="text-2xl mb-4 font-bold">Annales</h2>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );

  function renderContent() {
    if (!selectedMatiere) {
      return (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(data.annales).map(matiere => (
              <Button key={matiere} onClick={() => handleMatiereSelect(matiere)} variant="outline">
                {data.annales[matiere].original}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    const filesByYear = getFilesByYear();

    return (
      <div>
        <Button onClick={handleBack} variant="outline" className="mb-4">Retour</Button>
        <h2 className="text-2xl mb-4">{data.annales[selectedMatiere].original}</h2>
        <Button onClick={getRandomSujet} variant="outline" className="mb-4 w-full text-lg py-4">✨ Choisir automatiquement un Sujet Aléatoire</Button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(filesByYear).map(year => (
            <Card key={year} className="p-4">
              <h3 className="text-xl font-bold mb-2">{year}</h3>
              <div className="flex justify-between">
                <Button 
                  onClick={() => window.open(`/Annales/${encodeURIComponent(selectedMatiere)}/${encodeURIComponent(filesByYear[year].sujet)}`, '_blank')}
                  variant="outline"
                  disabled={!filesByYear[year].sujet}
                  className="w-full py-4 mr-2"
                >
                  Sujet
                </Button>
                <Button 
                  onClick={() => window.open(`/Annales/${encodeURIComponent(selectedMatiere)}/${encodeURIComponent(filesByYear[year].corrige)}`, '_blank')}
                  variant="outline"
                  disabled={!filesByYear[year].corrige}
                  className="w-full py-4 ml-2"
                >
                  Corrigé
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
}
