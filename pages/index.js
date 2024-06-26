import { useState } from 'react';
import fs from 'fs';
import path from 'path';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Fiche from './fiche';
import Annales from './annales';

export default function Home({ data }) {
  const [mode, setMode] = useState('fiches');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Révision Brevet</h1>
      
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fiches">Fiches de révision</TabsTrigger>
          <TabsTrigger value="annales">Annales</TabsTrigger>
        </TabsList>
        <TabsContent value="fiches">
          <Fiche data={data} />
        </TabsContent>
        <TabsContent value="annales">
          <Annales data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export async function getStaticProps() {
  const dataFilePath = path.join(process.cwd(), 'public', 'data.json');
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

  return {
    props: {
      data,
    },
  };
}
