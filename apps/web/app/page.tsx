import React from 'react';
import { Button, Text, Badge } from '@walikelas/ui';
import { TOOLS } from '@walikelas/config';

export default function HomePage() {
  const localTools = TOOLS.filter((tool) => tool.category === 'LOCAL');
  const interactiveTools = TOOLS.filter((tool) => tool.category === 'INTERACTIVE');
  const contentTools = TOOLS.filter((tool) => tool.category === 'CONTENT');

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-blue-600">WaliKelas</span>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-sm font-semibold text-slate-700">Teaching Tools</span>
            <Badge variant="neutral" size="sm">
              V1 Foundation
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Gabung Sesi Siswa
            </Button>
            <Button variant="primary" size="sm">
              Masuk dengan Google
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Intro */}
        <section className="space-y-3">
          <Badge variant="default" size="sm">
            Praktis &amp; Langsung Pakai
          </Badge>
          <Text as="h1" variant="h1">
            Perkakas Pembelajaran Interaktif di Kelas
          </Text>
          <Text variant="body" className="max-w-2xl text-slate-600">
            Membantu guru mengelola interaksi kelas dengan cepat — dari alat bantu lokal seperti
            Timer dan Random Picker, hingga aktivitas langsung seperti Live Quiz dan Live Poll.
          </Text>
        </section>

        {/* Local Tools Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Text as="h2" variant="h3">
                Alat Bantu Guru (Lokal)
              </Text>
              <Text variant="body-sm" className="text-slate-500">
                Dapat digunakan langsung tanpa perlu login atau koneksi internet stabil.
              </Text>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localTools.map((tool) => (
              <div
                key={tool.id}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition-colors flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Text as="h3" variant="h4">
                      {tool.name}
                    </Text>
                    <Badge variant="neutral" size="sm">
                      {tool.priority}
                    </Badge>
                  </div>
                  <Text variant="body-sm" className="text-slate-600">
                    {tool.description}
                  </Text>
                </div>
                <Button variant="secondary" size="sm" className="w-full">
                  Buka {tool.name}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Tools Section */}
        <section className="space-y-4">
          <div>
            <Text as="h2" variant="h3">
              Aktivitas Interaktif Siswa
            </Text>
            <Text variant="body-sm" className="text-slate-500">
              Menggunakan Classroom Session Engine untuk partisipasi realtime siswa.
            </Text>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {interactiveTools.map((tool) => (
              <div
                key={tool.id}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition-colors flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Text as="h3" variant="h4">
                      {tool.name}
                    </Text>
                    <Badge variant="default" size="sm">
                      Realtime
                    </Badge>
                  </div>
                  <Text variant="body-sm" className="text-slate-600">
                    {tool.description}
                  </Text>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Mulai Sesi
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Content Tools */}
        {contentTools.length > 0 && (
          <section className="space-y-4">
            <div>
              <Text as="h2" variant="h3">
                Konten &amp; Pengulangan Materi
              </Text>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentTools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition-colors flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Text as="h3" variant="h4">
                        {tool.name}
                      </Text>
                      <Badge variant="neutral" size="sm">
                        Konten
                      </Badge>
                    </div>
                    <Text variant="body-sm" className="text-slate-600">
                      {tool.description}
                    </Text>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">
                    Buka {tool.name}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} WaliKelas Teaching Tools. Standalone classroom tools.
          </p>
          <p>Domain: tools.walikelas.id</p>
        </div>
      </footer>
    </div>
  );
}
