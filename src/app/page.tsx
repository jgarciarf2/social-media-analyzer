'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Search, TrendingUp, MessageCircle, Users, AlertCircle, BarChart3, Brain } from 'lucide-react'

interface SentimentAnalysis {
  positive: number
  negative: number
  neutral: number
  total: number
  summary: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null)
  const [error, setError] = useState('')

  const analyzeContent = async () => {
    if (!url.trim()) {
      setError('Por favor ingresa una URL válida')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Error al analizar el contenido')
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError('Error al analizar el contenido. Intenta nuevamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sentimentData = analysis ? [
    { name: 'Positivos', value: analysis.positive, color: '#10b981' },
    { name: 'Negativos', value: analysis.negative, color: '#ef4444' },
    { name: 'Neutros', value: analysis.neutral, color: '#6b7280' },
  ] : []

  const barData = analysis ? [
    { sentiment: 'Positivos', count: analysis.positive, fill: '#10b981' },
    { sentiment: 'Negativos', count: analysis.negative, fill: '#ef4444' },
    { sentiment: 'Neutros', count: analysis.neutral, fill: '#6b7280' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Social Media Analyzer</h1>
              <p className="text-sm text-gray-600">Análisis de sentimientos con IA</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              URL del Post o Perfil
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://instagram.com/p/example"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
              <button
                onClick={analyzeContent}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analizando...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Analizar
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Nota del Prototipo */}
          {/* <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium mb-1">Nota del Prototipo</p>
                <p className="text-amber-700">
                  Esta aplicación utiliza <strong>comentarios simulados</strong> para demostrar el análisis de sentimientos. 
                  Los comentarios no son extraídos del post real debido a las limitaciones de las APIs de redes sociales. 
                  Gemini AI analiza estos comentarios de ejemplo para mostrar la funcionalidad.
                </p>
              </div>
            </div>
          </div> */}
          
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">{analysis.total}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Total Comentarios</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <span className="text-2xl font-bold text-emerald-600">{analysis.positive}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Positivos</p>
                <p className="text-xs text-gray-400">
                  {((analysis.positive / analysis.total) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">{analysis.negative}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Negativos</p>
                <p className="text-xs text-gray-400">
                  {((analysis.negative / analysis.total) * 100).toFixed(1)}%
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-5 w-5 text-gray-500" />
                  <span className="text-2xl font-bold text-gray-600">{analysis.neutral}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Neutros</p>
                <p className="text-xs text-gray-400">
                  {((analysis.neutral / analysis.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="sentiment" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proporción</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {sentimentData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumen del Análisis</h3>
              <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!analysis && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              ¿Cómo funciona?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Copia la URL</h3>
                <p className="text-sm text-gray-600">De un post de Instagram, Facebook u otra red social</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">2</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Pega la URL</h3>
                <p className="text-sm text-gray-600">En el campo de entrada de arriba</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">3</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Analizar</h3>
                <p className="text-sm text-gray-600">La IA procesará los comentarios automáticamente</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold">4</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Ver Resultados</h3>
                <p className="text-sm text-gray-600">Estadísticas detalladas y resumen por IA</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              © 2025 Social Media Analyzer
            </p>
            <p className="text-sm text-gray-500">
              Powered by jgarciarf2
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
