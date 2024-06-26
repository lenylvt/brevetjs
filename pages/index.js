import { useState } from 'react';
import fs from 'fs';
import path from 'path';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home({ data }) {
  const [mode, setMode] = useState('fiches');
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [selectedChapitre, setSelectedChapitre] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('tout');

  const handleMatiereSelect = (matiere) => {
    setSelectedMatiere(matiere);
    setSelectedChapitre(null);
  };

  const handleChapitreSelect = (chapitre) => {
    setSelectedChapitre(chapitre);
  };

  const filteredContent = () => {
    if (!selectedMatiere) return [];

    if (mode === 'fiches') {
      if (!selectedChapitre) {
        return Object.keys(data.revisions[selectedMatiere]).filter(chapitre => 
          chapitre.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        return data.revisions[selectedMatiere][selectedChapitre].filter(fiche => 
          fiche.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    } else if (mode === 'annales') {
      const annees = data.annales[selectedMatiere] || [];
      return annees.filter(annee => {
        const matchesSearch = annee.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'tout' || (filter === 'corrige' ? annee.toLowerCase().includes('corrige') : !annee.toLowerCase().includes('corrige'));
        return matchesSearch && matchesFilter;
      });
    }
  };

  const isImage = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  };

  const isPDF = (filename) => {
    return path.extname(filename).toLowerCase() === '.pdf';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Révision Brevet</h1>
      
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fiches">Fiches de révision</TabsTrigger>
          <TabsTrigger value="annales">Annales</TabsTrigger>
        </TabsList>
        <TabsContent value="fiches">
          <Card>
            <CardHeader>
              <CardTitle>Fiches de révision</CardTitle>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="annales">
          <Card>
            <CardHeader>
              <CardTitle>Annales</CardTitle>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderContent() {
    if (!selectedMatiere) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(mode === 'fiches' ? data.revisions : data.annales).map(matiere => (
            <Button key={matiere} onClick={() => handleMatiereSelect(matiere)} variant="outline">
              {matiere}
            </Button>
          ))}
        </div>
      );
    }

    if (mode === 'fiches' && !selectedChapitre) {
      return (
        <div>
          <h2 className="text-2xl mb-2">{selectedMatiere}</h2>
          <Input 
            type="text" 
            placeholder="Rechercher un chapitre..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent().map(chapitre => (
              <Button key={chapitre} onClick={() => handleChapitreSelect(chapitre)} variant="outline">
                {chapitre}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-2xl mb-2">{selectedMatiere} {selectedChapitre && `- ${selectedChapitre}`}</h2>
        <Input 
          type="text" 
          placeholder="Rechercher..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
        />
        {mode === 'annales' && (
          <div className="flex space-x-2 mb-2">
            <Button onClick={() => setFilter('tout')} variant={filter === 'tout' ? 'default' : 'outline'}>Tout</Button>
            <Button onClick={() => setFilter('corrige')} variant={filter === 'corrige' ? 'default' : 'outline'}>Corrigés</Button>
            <Button onClick={() => setFilter('sujet')} variant={filter === 'sujet' ? 'default' : 'outline'}>Sujets</Button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent().map(item => (
            <Card key={item}>
              <CardContent className="pt-6">
                {mode === 'fiches' && isImage(item) ? (
                  <img src={`./public/Revision/${encodeURIComponent(selectedMatiere)}/${encodeURIComponent(selectedChapitre)}/${encodeURIComponent(item)}`} alt={item} className="max-w-full h-auto" />
                  
                ) : mode === 'annales' && isPDF(item) ? (
                  <a href={`./public/Annales/${encodeURIComponent(selectedMatiere)}/${encodeURIComponent(item)}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {item}
                  </a>
                ) : (
                  <p>Fichier non pris en charge : {item}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
}

export async function getStaticProps() {
  const dataFilePath = path.join(process.cwd(), './public/data.json');
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

  return {
    props: {
      data,
    },
  };
}
