import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import Navbar from './landing/Navbar';
const AuthModal = React.lazy(() => import('./AuthModal'));

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [residenceResults, setResidenceResults] = useState<any[]>([]);
  const [showResidenceList, setShowResidenceList] = useState(false);
  const [residenceSearch, setResidenceSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    gender: 'Mujer',
    birth_day: 1,
    birth_month: 1,
    birth_year: 1990,
    nationality: '',
    residence_city: '',
    residence_country: '',
    occupation: '',
    has_children: false,
    marital_status: 'Soltero/a',
    has_pets: false,
  });

  const [countries, setCountries] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [showCountryList, setShowCountryList] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await profileApi.getProfile();
        if (data && Object.keys(data).length > 0) {
          // Handle birth_date conversion if necessary
          let bDay = 1, bMonth = 1, bYear = 1990;
          if (data.birth_date) {
            const d = new Date(data.birth_date);
            bDay = d.getDate();
            bMonth = d.getMonth() + 1;
            bYear = d.getFullYear();
          }
          setProfile(prev => ({
            ...prev,
            ...data,
            birth_day: bDay,
            birth_month: bMonth,
            birth_year: bYear,
          }));
          if (data.residence_city && data.residence_country) {
            setResidenceSearch(`${data.residence_city}, ${data.residence_country}`);
          } else if (data.residence_city || data.residence_country) {
            setResidenceSearch(data.residence_city || data.residence_country);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name');
        const data = await res.json();
        const names = data.map((c: any) => c.name.common).sort();
        setCountries(names);
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };

    loadProfile();
    fetchCountries();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setProfile(prev => ({ ...prev, [name]: val }));
  };

  const handlePetChange = (val: boolean) => {
    setProfile(prev => ({ ...prev, has_pets: val }));
  };

  const handleCountrySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProfile(prev => ({ ...prev, nationality: val }));
    if (val.length > 1) {
      const filtered = countries.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
      setFilteredCountries(filtered);
      setShowCountryList(true);
    } else {
      setShowCountryList(false);
    }
  };

  const selectCountry = (c: string) => {
    setProfile(prev => ({ ...prev, nationality: c }));
    setShowCountryList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Construct birth_date from components
      const birth_date = `${profile.birth_year}-${String(profile.birth_month).padStart(2, '0')}-${String(profile.birth_day).padStart(2, '0')}`;
      const { birth_day, birth_month, birth_year, ...dataToSave } = profile;
      await profileApi.updateProfile({ ...dataToSave, birth_date });
      alert('Perfil actualizado con éxito');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleResidenceSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setResidenceSearch(query);
    
    if (query.trim().length > 1) {
      setSearching(true);
      try {
        console.log(`Buscando ubicación: ${query}`);
        const res = await axios.get(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        console.log("Resultados obtenidos:", res.data.features);
        setResidenceResults(res.data.features || []);
        setShowResidenceList(true);
      } catch (err) {
        console.error("Error fetching locations from Photon:", err);
        // Fallback or just silent error
      } finally {
        setSearching(false);
      }
    } else {
      setResidenceResults([]);
      setShowResidenceList(false);
    }
  };

  const selectResidence = (feature: any) => {
    const city = feature.properties.city || feature.properties.name || '';
    const country = feature.properties.country || '';
    setProfile(prev => ({
      ...prev,
      residence_city: city,
      residence_country: country
    }));
    setResidenceSearch(`${city}, ${country}`);
    setShowResidenceList(false);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-vx-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
      <div className="pt-12 pb-12 px-4 flex-1">
      <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-vx-primary to-vx-accent bg-clip-text text-transparent">
          Editar Perfil
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Nombre</label>
              <input
                type="text"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-vx-primary transition-colors"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Apellido</label>
              <input
                type="text"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-vx-primary transition-colors"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Género</label>
            <div className="flex gap-2">
              {['Mujer', 'Hombre', 'Otro'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setProfile(prev => ({ ...prev, gender: g }))}
                  className={`flex-1 py-3 rounded-xl border transition-all ${profile.gender === g ? 'bg-vx-primary/20 border-vx-primary text-white font-bold' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Fecha de Nacimiento</label>
            <div className="grid grid-cols-3 gap-4">
              <select name="birth_day" value={profile.birth_day} onChange={handleChange} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select name="birth_month" value={profile.birth_month} onChange={handleChange} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select name="birth_year" value={profile.birth_year} onChange={handleChange} className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Nacionalidad</label>
            <input
              type="text"
              name="nationality"
              value={profile.nationality}
              onChange={handleCountrySearch}
              onBlur={() => setTimeout(() => setShowCountryList(false), 200)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-vx-primary transition-colors"
              placeholder="Busca tu país…"
            />
            {showCountryList && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                {filteredCountries.map(c => (
                  <div 
                    key={c} 
                    onClick={() => selectCountry(c)}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm"
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Lugar de Residencia (Ciudad, País)</label>
            <input
              type="text"
              name="residence_search"
              value={residenceSearch}
              onChange={handleResidenceSearch}
              onBlur={() => setTimeout(() => setShowResidenceList(false), 200)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-vx-primary transition-colors pr-10"
              placeholder="Ej: Madrid, España…"
            />
            {searching && (
              <div className="absolute right-3 top-[38px] w-4 h-4 border-2 border-vx-primary border-t-transparent rounded-full animate-spin"></div>
            )}
            {showResidenceList && residenceResults.length > 0 && (
              <div className="absolute z-[100] w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                {residenceResults.map((feat, idx) => {
                  const city = feat.properties.city || feat.properties.name || '';
                  const country = feat.properties.country || '';
                  const state = feat.properties.state ? `, ${feat.properties.state}` : '';
                  return (
                    <div 
                      key={idx} 
                      onClick={() => selectResidence(feat)}
                      className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm"
                    >
                      <span className="font-bold">{city}</span>{state}, <span className="text-gray-400">{country}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Ocupación</label>
              <span className={`text-[10px] font-bold ${profile.occupation?.length === 100 ? 'text-red-500' : 'text-gray-600'}`}>
                {profile.occupation?.length || 0}/100
              </span>
            </div>
            <input
              type="text"
              name="occupation"
              value={profile.occupation}
              onChange={handleChange}
              maxLength={100}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-vx-primary transition-colors"
              placeholder="¿A qué te dedicas?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Estado Civil</label>
              <select name="marital_status" value={profile.marital_status} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-vx-primary transition-colors">
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Viudo/a">Viudo/a</option>
                <option value="En pareja">En pareja</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Hijos</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setProfile(prev => ({ ...prev, has_children: true }))}
                  className={`flex-1 py-3 rounded-xl border transition-all ${profile.has_children ? 'bg-vx-primary/20 border-vx-primary text-white font-bold' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}`}
                >
                  Sí
                </button>
                <button 
                  type="button"
                  onClick={() => setProfile(prev => ({ ...prev, has_children: false }))}
                  className={`flex-1 py-3 rounded-xl border transition-all ${!profile.has_children ? 'bg-vx-primary/20 border-vx-primary text-white font-bold' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">¿Tienes Mascotas?</label>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => handlePetChange(true)}
                className={`flex-1 py-3 rounded-xl border transition-all ${profile.has_pets ? 'bg-vx-primary/20 border-vx-primary text-white font-bold' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}`}
              >
                Sí
              </button>
              <button 
                type="button"
                onClick={() => handlePetChange(false)}
                className={`flex-1 py-3 rounded-xl border transition-all ${!profile.has_pets ? 'bg-vx-primary/20 border-vx-primary text-white font-bold' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}`}
              >
                No
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-vx-primary to-vx-accent text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-vx-primary/20 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar Perfil'}
          </button>
        </form>
      </div>
      </div>
      <React.Suspense fallback={null}>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </React.Suspense>
    </div>
  );
};

export default ProfilePage;
