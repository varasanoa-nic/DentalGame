import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Animated,
  Modal,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { WebView } from 'react-native-webview';


const { width } = Dimensions.get('window');



// 🏅 SISTEMA DI LIVELLI REALISTICI
const LEVELS = [
  { 
    level: 1, 
    name: 'Principiante', 
    requiredScore: 300, // ~25 punti/mese
    color: '#CCCCCC', 
    emoji: '🦷',
    description: 'Inizi a prendere la buona abitudine'
  },
  { 
    level: 2, 
    name: 'Apprendista', 
    requiredScore: 600, // ~50 punti/mese
    color: '#4FC3F7', 
    emoji: '🌟',
    description: 'Sei costante 2-3 volte a settimana'
  },
  { 
    level: 3, 
    name: 'Regolare', 
    requiredScore: 1200, // ~100 punti/mese
    color: '#4CAF50', 
    emoji: '⭐',
    description: 'Quasi tutti i giorni!'
  },
  { 
    level: 4, 
    name: 'Costante', 
    requiredScore: 2400, // ~200 punti/mese
    color: '#FF9800', 
    emoji: '👑',
    description: 'Tutti i giorni senza eccezioni'
  },
  { 
    level: 5, 
    name: 'Esperto', 
    requiredScore: 4800, // ~400 punti/mese
    color: '#9C27B0', 
    emoji: '🦸',
    description: 'Igiene dentale perfetta'
  },
  { 
    level: 6, 
    name: 'Maestro', 
    requiredScore: 9600, // ~800 punti/mese
    color: '#FF4081', 
    emoji: '⚡',
    description: 'Insegneresti agli altri!'
  },
  { 
    level: 7, 
    name: 'Leggenda', 
    requiredScore: 19200, // ~1600 punti/mese
    color: '#00BCD4', 
    emoji: '🏆',
    description: 'Mito dell\'igiene dentale!'
  },
];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const [show3DModal, setShow3DModal] = useState(false);
  const [isLoading3D, setIsLoading3D] = useState(true);

  const open3DModel = useCallback(() => {
    setShow3DModal(true);
    setIsLoading3D(true);
  }, []);

  
  // 📅 ABITUDINI CON PUNTI REALISTICI
  const [habits, setHabits] = useState([
    { 
      id: 1, 
      name: 'Spazzolino mattina', 
      done: false, 
      points: 2,
      frequency: 'giornaliera',
      description: 'Dopo colazione'
    },
    { 
      id: 2, 
      name: 'Spazzolino dopo pranzo', 
      done: false, 
      points: 2,
      frequency: 'giornaliera',
      description: 'Se si è a casa'
    },
    { 
      id: 3, 
      name: 'Spazzolino sera', 
      done: false, 
      points: 3,
      frequency: 'giornaliera',
      description: 'Prima di dormire'
    },
    { 
      id: 4, 
      name: 'Filo dentale', 
      done: false, 
      points: 5,
      frequency: 'giornaliera',
      description: 'La sera'
    },
    { 
      id: 5, 
      name: 'Collutorio', 
      done: false, 
      points: 3,
      frequency: 'giornaliera',
      description: 'Dopo lo spazzolino'
    },
    { 
      id: 6, 
      name: 'Visita dal dentista', 
      done: false, 
      points: 50,
      frequency: 'semestrale',
      description: 'Controllo ogni 6 mesi'
    },
    { 
      id: 7, 
      name: 'Cambio spazzolino', 
      done: false, 
      points: 20,
      frequency: 'trimestrale',
      description: 'Ogni 3 mesi'
    },
  ]);
  
  // 🏆 SISTEMA DI LIVELLI E PUNTEGGI
  const [dailyScore, setDailyScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [monthlyScore, setMonthlyScore] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');
  const [levelProgress, setLevelProgress] = useState(0);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  
  // 📊 STATISTICHE MENSILI (semplificate)
  const [monthlyStats, setMonthlyStats] = useState({
    perfectDays: 0, // Solo giorni perfetti rimane
  });
  
  // 🎵 AUDIO E TIMER
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // 🎮 MUSICHE DA VIDEOGIOCHI
  const gameMusic = [
    {
      id: 1,
      title: 'Arcade Game',
      artist: 'Musica da gioco',
      color: '#E52521',
      emoji: '🎮',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'      
    },
    {
      id: 2,
      title: 'Avventura',
      artist: 'Musica epica',
      color: '#2E8B57',
      emoji: '⚔️',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    {
      id: 3,
      title: 'Musica Energica',
      artist: 'Beat veloce',
      color: '#FF6B6B',
      emoji: '⚡',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
      id: 4,
      title: 'Melodia Allegra',
      artist: 'Tema positivo',
      color: '#FFD700',
      emoji: '🎵',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
    },
    {
      id: 5,
      title: 'Ritmo Divertente',
      artist: 'Beat dance',
      color: '#1E90FF',
      emoji: '💃',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
    }
  ];
  
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 💾 FUNZIONE PER SALVARE DATI
  const saveAllData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      
      const data = {
        totalScore,
        dailyScore,
        habits,
        currentLevel,
        monthlyScore,
        currentMonth: currentMonthKey,
        monthlyStats,
        monthlyHistory,
        averageScore,
        lastSaveDate: today,
        levelProgress
      };
      
      await AsyncStorage.setItem('@dentiSuperGameData', JSON.stringify(data));
      console.log('💾 Dati salvati');
    } catch (error) {
      console.error('Errore salvataggio:', error);
    }
  }, [totalScore, dailyScore, habits, currentLevel, monthlyScore, monthlyStats, monthlyHistory, averageScore, levelProgress]);

  // 📈 FUNZIONE PER CALCOLARE LA MEDIA
  const calculateAverage = useCallback((history) => {
    if (history.length === 0) return 0;
    
    // Prendi gli ultimi 3 mesi
    const recentMonths = history.slice(-3);
    const sum = recentMonths.reduce((total, month) => total + month.score, 0);
    const average = Math.round(sum / recentMonths.length);
    console.log('📊 Media calcolata:', average, 'da', recentMonths.length, 'mesi');
    return average;
  }, []);

  // 📈 FUNZIONE PER VERIFICARE LA SALITA DI LIVELLO
  const checkLevelUp = useCallback(() => {
    console.log('🔍 Verifico salita livello...');
    console.log('Livello attuale:', currentLevel);
    console.log('Media attuale:', averageScore);
    
    const nextLevelData = LEVELS.find(l => l.level === currentLevel + 1);
    
    if (nextLevelData) {
      const requiredAverage = nextLevelData.requiredScore / 12;
      console.log('Media richiesta per livello', nextLevelData.level, ':', requiredAverage);
      
      if (averageScore >= requiredAverage) {
        console.log('🎉 CONDIZIONE VERIFICATA! Salita di livello!');
        const newLevel = currentLevel + 1;
        const levelUpBonus = Math.round(nextLevelData.requiredScore * 0.1);
        
        setCurrentLevel(newLevel);
        setTotalScore(prev => prev + levelUpBonus);
        
        // Calcola progresso per il prossimo livello
        const nextNextLevelData = LEVELS.find(l => l.level === newLevel + 1);
        if (nextNextLevelData) {
          const nextRequiredAverage = nextNextLevelData.requiredScore / 12;
          const progress = Math.min(100, (averageScore / nextRequiredAverage) * 100);
          setLevelProgress(progress);
        }
        
        // Mostra notifica
        alert(`🎉 CONGRATULAZIONI! Sei salito al livello ${newLevel}: ${nextLevelData.name} ${nextLevelData.emoji}\nHai mantenuto una media di ${averageScore} punti/mese!\nBonus: +${levelUpBonus} punti!`);
        
        return true;
      } else {
        // Aggiorna comunque la barra di progresso
        const progress = Math.min(100, (averageScore / requiredAverage) * 100);
        setLevelProgress(progress);
        console.log('Progresso aggiornato:', progress, '%');
      }
    }
    
    return false;
  }, [currentLevel, averageScore]);

  // 💾 FUNZIONE PER CARICARE DATI
  const loadAllData = useCallback(async () => {
    try {
      const jsonData = await AsyncStorage.getItem('@dentiSuperGameData');
      const today = new Date().toISOString().split('T')[0];
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      
      if (jsonData) {
        const data = JSON.parse(jsonData);
        console.log('📂 Dati caricati:', data);
        
        // Controlla se è un nuovo giorno
        if (data.lastSaveDate !== today) {
          console.log('🔄 Nuovo giorno, reset abitudini giornaliere');
          
          // Nuovo giorno: resetta solo le abitudini GIORNALIERE
          setHabits(prevHabits => prevHabits.map(h => 
            h.frequency === 'giornaliera' ? { ...h, done: false } : h
          ));
          
          // Controlla se è un nuovo mese
          if (data.currentMonth !== currentMonthKey) {
            console.log('📅 Nuovo mese!', data.currentMonth, '->', currentMonthKey);
            
            // 🔥 NUOVO MESE: AGGIUNGI AL LO STORICO
            let updatedHistory = data.monthlyHistory || [];
            
            // Aggiungi il mese appena concluso allo storico
            if (data.monthlyScore > 0) {
              updatedHistory.push({
                month: data.currentMonth,
                score: data.monthlyScore
              });
              
              // Mantieni solo gli ultimi 12 mesi
              if (updatedHistory.length > 12) {
                updatedHistory = updatedHistory.slice(-12);
              }
            }
            
            console.log('📈 Storico aggiornato:', updatedHistory);
            
            // Calcola la nuova media
            const newAverage = calculateAverage(updatedHistory);
            console.log('📊 Nuova media:', newAverage);
            
            // Aggiorna lo stato
            setMonthlyHistory(updatedHistory);
            setAverageScore(newAverage);
            
            // Resetta per nuovo mese
            setMonthlyScore(0);
            setCurrentMonth(currentMonthKey);
            setMonthlyStats({
              perfectDays: 0, // Resetta giorni perfetti
            });
            
            // Calcola progresso verso prossimo livello
            const nextLevelData = LEVELS.find(l => l.level === (data.currentLevel || 1) + 1);
            const nextLevelReq = nextLevelData ? nextLevelData.requiredScore : 2400;
            const progress = Math.min(100, (newAverage / (nextLevelReq / 12)) * 100);
            setLevelProgress(progress);
            console.log('📊 Progresso iniziale:', progress, '%');
            
          } else {
            // Stesso mese: mantieni dati
            console.log('📅 Stesso mese, mantengo dati');
            setMonthlyScore(data.monthlyScore || 0);
            setMonthlyStats(data.monthlyStats || {
              perfectDays: 0,
            });
            setMonthlyHistory(data.monthlyHistory || []);
            setAverageScore(data.averageScore || 0);
            
            // Calcola progresso
            const nextLevelData = LEVELS.find(l => l.level === (data.currentLevel || 1) + 1);
            const nextLevelReq = nextLevelData ? nextLevelData.requiredScore : 2400;
            const progress = Math.min(100, ((data.averageScore || 0) / (nextLevelReq / 12)) * 100);
            setLevelProgress(progress);
          }
          
          setDailyScore(0);
          setTotalScore(data.totalScore || 0);
          setCurrentLevel(data.currentLevel || 1);
          setCurrentMonth(currentMonthKey);
          
        } else {
          // Stesso giorno: carica tutto
          console.log('📅 Stesso giorno, carico tutto');
          setTotalScore(data.totalScore || 0);
          setDailyScore(data.dailyScore || 0);
          setHabits(data.habits || habits);
          setCurrentLevel(data.currentLevel || 1);
          setMonthlyScore(data.monthlyScore || 0);
          setCurrentMonth(data.currentMonth || currentMonthKey);
          setMonthlyStats(data.monthlyStats || monthlyStats);
          setMonthlyHistory(data.monthlyHistory || []);
          setAverageScore(data.averageScore || 0);
          setLevelProgress(data.levelProgress || 0);
        }
      } else {
        // Prima volta: inizializza
        console.log('🎮 Prima volta, inizializzo');
        setCurrentMonth(currentMonthKey);
        setMonthlyHistory([]);
        setAverageScore(0);
      }
    } catch (error) {
      console.error('❌ Errore caricamento:', error);
    }
  }, []);

  // 🎵 FUNZIONI AUDIO PER IL TIMER
  const stopSound = useCallback(async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Errore nello stop:', error);
    }
  }, [sound]);

  const playSound = useCallback(async (music) => {
    try {
      setIsLoadingAudio(true);
      
      // Ferma la musica attuale se c'è
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      
      // Configura l'audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
      
      // Carica e riproduci l'URL
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: music.audioUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setSelectedMusic(music);
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Errore nella riproduzione:', error);
      // Fallback
      setSelectedMusic(music);
      setIsPlaying(false);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [sound]);

  // 🔄 TOGGLE ABITUDINE - VERSIONE SEMPLICE E FUNZIONANTE
  const toggleHabit = useCallback((id) => {
    console.log('🔄 Toggle habit id:', id);
    
    setHabits(prevHabits => {
      // Crea una nuova copia delle abitudini
      const newHabits = prevHabits.map(habit => {
        if (habit.id === id) {
          const newDoneState = !habit.done;
          console.log(`  ${habit.name}: ${habit.done} -> ${newDoneState} (+${habit.points} punti)`);
          
          // Calcola la differenza di punti
          const pointsDifference = newDoneState ? habit.points : -habit.points;
          
          // Aggiorna i punteggi
          setDailyScore(prev => {
            const newDaily = prev + pointsDifference;
            console.log(`  Daily score: ${prev} -> ${newDaily}`);
            return newDaily;
          });
          
          setMonthlyScore(prev => {
            const newMonthly = prev + pointsDifference;
            console.log(`  Monthly score: ${prev} -> ${newMonthly}`);
            return newMonthly;
          });
          
          setTotalScore(prev => {
            const newTotal = prev + pointsDifference;
            console.log(`  Total score: ${prev} -> ${newTotal}`);
            return newTotal;
          });
          
          return { ...habit, done: newDoneState };
        }
        return habit;
      });
      
      // Dopo aver aggiornato le abitudini, controlla i bonus
      setTimeout(() => {
        // Controlla se tutte le abitudini giornaliere sono completate
        const dailyHabits = newHabits.filter(h => h.frequency === 'giornaliera');
        const allDailyDone = dailyHabits.every(h => h.done);
        
        console.log('📊 Tutte le giornaliere completate?', allDailyDone);
        
        if (allDailyDone) {
          // Bonus giornaliero
          const dailyBonus = 10;
          console.log(`🎁 Bonus giornaliero: +${dailyBonus} punti`);
          
          setTotalScore(prev => {
            const newTotal = prev + dailyBonus;
            console.log(`  Total con bonus: ${prev} -> ${newTotal}`);
            return newTotal;
          });
          
          setMonthlyScore(prev => prev + dailyBonus);
          setDailyScore(prev => prev + dailyBonus);
          
          // Aggiorna giorni perfetti
          setMonthlyStats(prev => ({
            ...prev,
            perfectDays: prev.perfectDays + 1
          }));
        }
        
        // Verifica salita di livello
        checkLevelUp();
      }, 100);
      
      return newHabits;
    });
  }, [checkLevelUp]);

  // ⏱️ FUNZIONI DEL TIMER
  const toggleTimer = useCallback(() => {
    if (!timerActive && secondsLeft === 0) {
      setSecondsLeft(120);
    }
    setTimerActive(prev => !prev);
  }, [timerActive, secondsLeft]);

  const resetTimer = useCallback(() => {
    setTimerActive(false);
    setSecondsLeft(120);
    stopSound();
    setSelectedMusic(null);
  }, [stopSound]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🎯 TIMER COMPLETATO
  const handleTimerComplete = useCallback(() => {
    console.log('⏱️ Timer completato!');
    const timerBonus = 50;
    
    setTotalScore(prev => {
      const newTotal = prev + timerBonus;
      console.log(`  Total: ${prev} -> ${newTotal}`);
      return newTotal;
    });
    
    setMonthlyScore(prev => {
      const newMonthly = prev + timerBonus;
      console.log(`  Monthly: ${prev} -> ${newMonthly}`);
      return newMonthly;
    });
    
    setDailyScore(prev => {
      const newDaily = prev + timerBonus;
      console.log(`  Daily: ${prev} -> ${newDaily}`);
      return newDaily;
    });
    
    // Verifica salita di livello
    setTimeout(() => {
      checkLevelUp();
    }, 500);
  }, [checkLevelUp]);

  // 📅 INIZIALIZZA APP
  useEffect(() => {
    const initializeApp = async () => {
      await loadAllData();
      
      // Splash screen
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setIsLoading(false));
      }, 1500);
    };
    
    initializeApp();
  }, [fadeAnim, loadAllData]);

  // ⏱️ EFFETTO DEL TIMER
  useEffect(() => {
    let interval = null;
    if (timerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(seconds => {
          if (seconds <= 1) {
            // Timer completato
            setTimeout(() => {
              handleTimerComplete();
            }, 100);
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    } else if (secondsLeft === 0 && timerActive) {
      setTimerActive(false);
      stopSound();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, secondsLeft, handleTimerComplete, stopSound]);

  // 💾 SALVA AUTOMATICAMENTE QUANDO CAMBIANO I DATI
  useEffect(() => {
    if (!isLoading) {
      const saveTimeout = setTimeout(() => {
        saveAllData();
      }, 1000);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [totalScore, dailyScore, habits, monthlyScore, monthlyStats, currentLevel, levelProgress, isLoading, saveAllData, monthlyHistory, averageScore]);

  // 🎯 FUNZIONE PER FORMATTARE LA DATA
  const getCurrentMonthName = () => {
    const monthNames = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return monthNames[new Date().getMonth()];
  };

  // 🎮 CALCOLA INFO LIVELLO ATTUALE
  const getCurrentLevelInfo = () => {
    return LEVELS.find(l => l.level === currentLevel) || LEVELS[0];
  };

  const getNextLevelInfo = () => {
    return LEVELS.find(l => l.level === currentLevel + 1);
  };

  // Chiudi il modal timer
  const closeTimerModal = useCallback(() => {
    setShowTimerModal(false);
    resetTimer();
  }, [resetTimer]);



  if (isLoading) {
    return (
      <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#4fc3f7', '#29b6f6']}
          style={styles.splashGradient}
        >
          <View style={styles.splashContent}>
            <View style={styles.logoContainer}>
              <View style={styles.toothLogo}>
                <Text style={styles.toothEmoji}>🦷</Text>
              </View>
              <Text style={styles.logoText}>DENTI</Text>
              <Text style={styles.logoSubText}>SUPER</Text>
              <Text style={styles.splashVersion}>Livello {currentLevel}</Text>
            </View>
            
            <Text style={styles.splashText}>
              Preparati per un sorriso leggendario!
            </Text>
            
            <View style={styles.loadingContainer}>
              <View style={styles.loadingDot}></View>
              <View style={styles.loadingDot}></View>
              <View style={styles.loadingDot}></View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  const currentLevelInfo = getCurrentLevelInfo();
  const nextLevelInfo = getNextLevelInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* HEADER CON LIVELLO */}
        <LinearGradient
          colors={[currentLevelInfo.color, '#4fc3f7']}
          style={styles.header}
        >
          <Text style={styles.title}>🦷 Denti Super! 🦷</Text>
          <Text style={styles.subtitle}>Livello {currentLevel}: {currentLevelInfo.name} {currentLevelInfo.emoji}</Text>
        </LinearGradient>

        {/* 🏆 PUNTEGGIO TOTALE E LIVELLO */}
        <View style={styles.totalScoreSection}>
          <View style={styles.totalScoreCard}>
            <Text style={styles.totalScoreLabel}>PUNTEGGIO TOTALE</Text>
            <Text style={styles.totalScoreValue}>{totalScore} 🏆</Text>
          </View>
          
          {/* BARRA PROGRESSO LIVELLO */}
          <View style={styles.levelProgressCard}>
            <Text style={styles.levelProgressTitle}>
              Progresso {getCurrentMonthName()}: {monthlyScore} punti
            </Text>
            
            {/* 📊 MEDIA CALCOLATA CORRETTAMENTE */}
            <Text style={styles.averageText}>
              📊 Media ultimi 3 mesi: {averageScore} punti/mese
            </Text>
            
            {nextLevelInfo && (
              <>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill,
                        { 
                          width: `${levelProgress}%`,
                          backgroundColor: currentLevelInfo.color
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(levelProgress)}% verso livello {nextLevelInfo.level}
                  </Text>
                </View>
                
                <Text style={styles.nextLevelText}>
                  Prossimo: {nextLevelInfo.name} ({Math.round(nextLevelInfo.requiredScore / 12)} punti/mese in media)
                </Text>
              </>
            )}
            
            <Text style={styles.monthlyGoal}>
              Obiettivo mensile: {nextLevelInfo ? Math.round(nextLevelInfo.requiredScore / 12) : 25} punti in media
            </Text>
          </View>
        </View>

        {/* 📊 STATISTICHE MENSILI SEMPLIFICATE */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📈 Statistiche {getCurrentMonthName()}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthlyStats.perfectDays}</Text>
              <Text style={styles.statLabel}>Giorni perfetti</Text>
              <Text style={styles.statSubLabel}>(tutte le abitudini)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthlyScore}</Text>
              <Text style={styles.statLabel}>Punti mese</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{averageScore}</Text>
              <Text style={styles.statLabel}>Media 3 mesi</Text>
              <Text style={styles.statSubLabel}>(punti/mese)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalScore}</Text>
              <Text style={styles.statLabel}>Punti totali</Text>
            </View>
          </View>
        </View>

        {/* 📅 STORICO MENSILE */}
        {monthlyHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>📅 Storico Ultimi Mesi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {monthlyHistory.slice().reverse().slice(0, 6).map((monthData, index) => (
                <View key={index} style={styles.historyCard}>
                  <Text style={styles.historyMonth}>
                    {monthData.month.split('-')[1]}/{monthData.month.split('-')[0].slice(2)}
                  </Text>
                  <Text style={styles.historyScore}>{monthData.score}</Text>
                  <Text style={styles.historyLabel}>punti</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 📅 ABITUDINI GIORNALIERE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📅 Routine di Oggi - {dailyScore} punti
          </Text>
          {habits.map(habit => (
            <TouchableOpacity 
              key={habit.id} 
              style={[
                styles.habitItem, 
                habit.done && styles.habitDone,
                { 
                  borderLeftColor: habit.done ? currentLevelInfo.color : '#DDD',
                  opacity: habit.frequency === 'giornaliera' ? 1 : 0.9
                }
              ]}
              onPress={() => toggleHabit(habit.id)}
              activeOpacity={0.7}
            >
              <View style={styles.habitContent}>
                <Text style={styles.habitText}>
                  {habit.done ? '✅' : '⚪'} {habit.name}
                </Text>
                {habit.description && (
                  <Text style={styles.habitDesc}>{habit.description}</Text>
                )}
              </View>
              
              <View style={styles.habitPointsContainer}>
                <Text style={[
                  styles.habitPoints,
                  { backgroundColor: habit.points >= 5 ? '#FFEBEE' : '#E8F5E9' }
                ]}>
                  +{habit.points} punti
                </Text>
                {habit.frequency !== 'giornaliera' && (
                  <Text style={styles.habitFrequency}>({habit.frequency})</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🎁 RICOMPENSE */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>🎁 Ricompense</Text>
          
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>Bonus Giornaliero</Text>
            <Text style={styles.rewardDesc}>Completa tutte le abitudini giornaliere: +10 punti</Text>
          </View>
          
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>Timer Completato</Text>
            <Text style={styles.rewardDesc}>2 minuti di spazzolino: +50 punti</Text>
          </View>
          
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>Salita di Livello</Text>
            <Text style={styles.rewardDesc}>Raggiungi una buona media mensile: bonus punti!</Text>
          </View>
        </View>

        {/* 🎮 GIOCHI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 Giochi per Guadagnare Punti</Text>
          
          <TouchableOpacity 
            style={styles.gameButton}
            onPress={() => setShowTimerModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.gameButtonText}>⏱️ Timer Spazzolino</Text>
            <Text style={styles.gameButtonSubText}>Completa per +50 punti!</Text>
          </TouchableOpacity>
          
         <TouchableOpacity 
            style={styles.gameButton}
            onPress={open3DModel}
            activeOpacity={0.7}
          >
            <Text style={styles.gameButtonText}>🔬 Esplora i Denti</Text>
            <Text style={styles.gameButtonSubText}>Modello 3D interattivo!</Text>
          </TouchableOpacity>
        </View>

        {/* 📋 LIVELLI DISPONIBILI */}
        <View style={styles.levelsSection}>
          <Text style={styles.sectionTitle}>🏅 Livelli da Sbloccare</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {LEVELS.map(level => (
              <View 
                key={level.level}
                style={[
                  styles.levelCard,
                  { 
                    backgroundColor: level.level <= currentLevel ? level.color : '#F5F5F5',
                    borderColor: level.level === currentLevel ? '#FFD700' : 'transparent'
                  }
                ]}
              >
                <Text style={styles.levelEmoji}>{level.emoji}</Text>
                <Text style={[
                  styles.levelNumber,
                  { color: level.level <= currentLevel ? 'white' : '#666' }
                ]}>
                  Lv. {level.level}
                </Text>
                <Text style={[
                  styles.levelName,
                  { color: level.level <= currentLevel ? 'white' : '#333' }
                ]}>
                  {level.name}
                </Text>
                {level.level > currentLevel && (
                  <Text style={styles.levelRequirement}>
                    {Math.round(level.requiredScore / 12)}/mese
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 💡 CONSIGLIO DEL GIORNO */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Consiglio del Livello {currentLevel}</Text>
          <Text style={styles.tipText}>
            {currentLevel === 1 && "Completa le abitudini 2-3 volte a settimana per iniziare!"}
            {currentLevel === 2 && "Prova a fare lo spazzolino mattina e sera!"}
            {currentLevel === 3 && "Usa il timer per assicurarti di lavarti i denti per 2 minuti!"}
            {currentLevel === 4 && "Ricorda di usare il filo dentale per una pulizia completa!"}
            {currentLevel === 5 && "Continua così! Stai diventando un esperto!"}
            {currentLevel >= 6 && "Sei fantastico! Condividi le tue buone abitudini con gli amici!"}
          </Text>
        </View>
      </ScrollView>

      {/* 🎵 MODAL TIMER COMPLETO */}
      <Modal
        visible={showTimerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeTimerModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⏱️ Timer Spazzolino</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeTimerModal}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* TIMER DISPLAY */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
              <Text style={styles.timerLabel}>minuti rimasti</Text>
              
              <View style={styles.timerControls}>
                <TouchableOpacity 
                  style={[styles.timerButton, timerActive ? styles.pauseButton : styles.startButton]}
                  onPress={toggleTimer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timerButtonText}>
                    {timerActive ? '⏸️ PAUSA' : '▶️ INIZIA'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.timerButton, styles.resetButton]}
                  onPress={resetTimer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timerButtonText}>🔄 RESET</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SELEZIONE MUSICA */}
            <Text style={styles.musicTitle}>🎵 Scegli la musica:</Text>
            <Text style={styles.musicSubtitle}>Musica divertente per il tuo spazzolino!</Text>
            
            {isLoadingAudio && (
              <View style={styles.loadingAudioContainer}>
                <Text style={styles.loadingAudioText}>Caricamento musica...</Text>
              </View>
            )}
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.musicScroll}>
              {gameMusic.map(music => (
                <TouchableOpacity 
                  key={music.id}
                  style={[
                    styles.musicCard,
                    { backgroundColor: music.color },
                    selectedMusic?.id === music.id && styles.selectedMusicCard
                  ]}
                  onPress={() => playSound(music)}
                  disabled={isLoadingAudio}
                  activeOpacity={0.7}
                >
                  <Text style={styles.musicEmoji}>{music.emoji}</Text>
                  <Text style={styles.musicCardTitle}>{music.title}</Text>
                  <Text style={styles.musicCardArtist}>{music.artist}</Text>
                  
                  {selectedMusic?.id === music.id && isPlaying && (
                    <View style={styles.playingIndicator}>
                      <View style={styles.soundWave}>
                        <View style={styles.waveBar}></View>
                        <View style={styles.waveBar}></View>
                        <View style={styles.waveBar}></View>
                        <View style={styles.waveBar}></View>
                      </View>
                      <Text style={styles.playingText}>IN RIPRODUZIONE</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* CONTROLLI MUSICA */}
            {selectedMusic && (
              <View style={styles.currentMusic}>
                <View style={styles.musicInfo}>
                  <Text style={styles.currentMusicEmoji}>{selectedMusic.emoji}</Text>
                  <View>
                    <Text style={styles.currentMusicTitle}>{selectedMusic.title}</Text>
                    <Text style={styles.currentMusicArtist}>{selectedMusic.artist}</Text>
                  </View>
                </View>
                
                <View style={styles.musicControls}>
                  {isPlaying ? (
                    <TouchableOpacity 
                      style={[styles.controlButton, styles.stopButton]}
                      onPress={stopSound}
                      disabled={isLoadingAudio}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.controlButtonText}>⏹️ FERMA</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.controlButton, styles.playButton]}
                      onPress={() => playSound(selectedMusic)}
                      disabled={isLoadingAudio}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.controlButtonText}>▶️ RIPRODUCI</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* TIPS */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Come funziona:</Text>
              <Text style={styles.tipsText}>1. Scegli una musica</Text>
              <Text style={styles.tipsText}>2. Premi PLAY per ascoltare</Text>
              <Text style={styles.tipsText}>3. Premi INIZIA per il timer</Text>
              <Text style={styles.tipsText}>4. Spazzola seguendo il ritmo!</Text>
              <Text style={[styles.tipsText, { fontWeight: 'bold', color: '#2E7D32' }]}>
                5. Completa per +50 punti! 🏆
              </Text>
            </View>
          </View>
        </View>
      </Modal>

          {/* 🦷 MODAL 3D SKETCHFAB */}
      <Modal
        visible={show3DModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShow3DModal(false)}
      >
        <View style={styles.modal3DOverlay}>
          <View style={styles.modal3DContent}>
            <View style={styles.modal3DHeader}>
              <Text style={styles.modal3DTitle}>🔬 Esplora i Denti in 3D</Text>
              <TouchableOpacity 
                style={styles.close3DButton}
                onPress={() => setShow3DModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.close3DButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modal3DDescription}>
              Modello anatomico 3D interattivo - Ruota e zoomma per esplorare!
            </Text>

            {isLoading3D && (
              <View style={styles.loading3DContainer}>
                <ActivityIndicator size="large" color="#4fc3f7" />
                <Text style={styles.loading3DText}>Caricamento modello 3D...</Text>
                <Text style={styles.loadingSubText}>Attendi qualche secondo</Text>
              </View>
            )}

            <WebView
              source={{ 
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <style>
                      body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
                      .container { width: 100vw; height: 100vh; }
                      iframe { width: 100%; height: 100%; border: none; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <iframe 
                        title="Human Tooth Anatomy" 
                        frameborder="0" 
                        allowfullscreen 
                        mozallowfullscreen="true" 
                        webkitallowfullscreen="true" 
                        allow="autoplay; fullscreen; xr-spatial-tracking" 
                        src="https://sketchfab.com/models/31c1ede1fcbd49c7af85825905446ec5/embed">
                      </iframe>
                    </div>
                    <script>
                      setTimeout(function() {
                        window.ReactNativeWebView.postMessage('LOADED');
                      }, 2000);
                    </script>
                  </body>
                  </html>
                `
              }}
              style={styles.webView}
              onLoad={() => setIsLoading3D(false)}
              onMessage={(event) => {
                if (event.nativeEvent.data === 'LOADED') {
                  setIsLoading3D(false);
                }
              }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
            />

            <View style={styles.modelControls}>
              <Text style={styles.controlsTitle}>👆 Controlli touch:</Text>
              <View style={styles.controlsRow}>
                <Text style={styles.controlText}>• <Text style={styles.bold}>Trascina</Text> con 1 dito per ruotare</Text>
                <Text style={styles.controlText}>• <Text style={styles.bold}>Pizzica</Text> per zoomare</Text>
              </View>
              <View style={styles.controlsRow}>
                <Text style={styles.controlText}>• <Text style={styles.bold}>2 dita</Text> per spostare</Text>
                <Text style={styles.controlText}>• <Text style={styles.bold}>Tocca controlli</Text> in alto</Text>
              </View>
              <Text style={styles.instructionText}>
                Il modello 3D si caricherà direttamente da Sketchfab
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 🎨 STILI COMPLETI
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0f9ff' 
  },
  splashContainer: { 
    flex: 1 
  },
  splashGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: { 
    alignItems: 'center', 
    padding: 30 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  toothLogo: { 
    width: 120, 
    height: 120, 
    backgroundColor: 'white', 
    borderRadius: 60, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    elevation: 10,
  },
  toothEmoji: { 
    fontSize: 60 
  },
  logoText: { 
    fontSize: 42, 
    fontWeight: 'bold', 
    color: 'white', 
    letterSpacing: 5,
  },
  logoSubText: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: '#ffeb3b', 
    marginTop: -5, 
    letterSpacing: 3,
  },
  splashVersion: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
  },
  splashText: { 
    fontSize: 18, 
    color: 'white', 
    textAlign: 'center', 
    marginTop: 20, 
    marginBottom: 40, 
    fontStyle: 'italic' 
  },
  loadingContainer: { 
    flexDirection: 'row', 
    marginTop: 50 
  },
  loadingDot: { 
    width: 15, 
    height: 15, 
    borderRadius: 7.5, 
    backgroundColor: 'white', 
    marginHorizontal: 8,
    opacity: 0.8,
  },
  header: {
    alignItems: 'center', 
    padding: 25, 
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25,
    elevation: 8,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: 'white',
  },
  subtitle: { 
    fontSize: 18, 
    color: 'white', 
    marginTop: 8,
    fontWeight: '600',
  },
  totalScoreSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  totalScoreCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    marginBottom: 15,
  },
  totalScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  totalScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  levelProgressCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  levelProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  averageText: {
    fontSize: 14,
    color: '#1976D2',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressBarBackground: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  nextLevelText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 10,
  },
  monthlyGoal: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  statsSection: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#00796b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historySection: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 5,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },
  historyCard: {
    width: 70,
    height: 70,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  historyMonth: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historyScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyLabel: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 5,
  },
  habitDone: {
    backgroundColor: '#E8F5E9',
  },
  habitContent: {
    flex: 1,
    marginRight: 10,
  },
  habitText: {
    fontSize: 16,
    color: '#333',
  },
  habitDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  habitPointsContainer: {
    alignItems: 'flex-end',
  },
  habitPoints: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  habitFrequency: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  rewardsSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },
  rewardCard: {
    backgroundColor: '#FFF9C4',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD600',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  rewardDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  gameButton: {
    backgroundColor: '#4fc3f7',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  gameButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameButtonSubText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 5,
  },
  levelsSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },
  levelCard: {
    width: 120,
    height: 140,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  levelEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  levelName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  levelRequirement: {
    fontSize: 10,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#FFF3E0',
    margin: 15,
    marginTop: 5,
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#FF9800',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 15,
    color: '#5D4037',
    lineHeight: 22,
  },
  
  // 🦷 STILI PER IL MODAL 3D
  modal3DOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    padding: 10,
  },
  modal3DContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    maxHeight: '95%',
  },
  modal3DHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modal3DTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00796b',
    flex: 1,
  },
  modal3DDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  close3DButton: {
    backgroundColor: '#ff6b6b',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  close3DButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loading3DContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  loading3DText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSubText: {
    marginTop: 5,
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  webView: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#000',
  },
  modelControls: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  controlText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});