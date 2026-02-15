import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { bsToAd, adToBs, nepaliMonths, englishMonths } from '../utils/dateConverter';

// --- Helper Components ---

const TypeSelector = ({ types, selectedType, onSelect, onNewType }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState('');

  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>IPO Type *</Text>
      <TouchableOpacity 
        style={styles.dropdownTrigger} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownTriggerText}>{selectedType || 'Select Type'}</Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <View style={styles.modalHeaderSmall}>
              <Text style={styles.modalTitleSmall}>Select Type</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setIsAdding(false); }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {isAdding ? (
              <View style={styles.addingContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new type..."
                  value={newType}
                  onChangeText={setNewType}
                  autoFocus
                />
                <TouchableOpacity 
                  style={styles.saveSmallBtn}
                  onPress={() => {
                    if (newType.trim()) {
                      onNewType(newType.trim());
                      setNewType('');
                      setIsAdding(false);
                      setModalVisible(false);
                    }
                  }}
                >
                  <Text style={styles.saveSmallBtnText}>Add Type</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.typeList}>
                {types.map((type) => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.typeItem, selectedType === type && styles.typeItemActive]}
                    onPress={() => {
                      onSelect(type);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.typeItemText, selectedType === type && styles.typeItemTextActive]}>
                      {type}
                    </Text>
                    {selectedType === type && <Ionicons name="checkmark" size={20} color="#6200EE" />}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={styles.addTypeBtn}
                  onPress={() => setIsAdding(true)}
                >
                  <Ionicons name="plus-circle-outline" size={20} color="#6200EE" />
                  <Text style={styles.addTypeBtnText}>Add Custom Type</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const NepaliDatePicker = ({ label, date, time, onChange, onTimeChange }) => {
  const [mode, setMode] = useState('BS'); // 'BS' or 'AD'
  const bsDate = adToBs(date) || { year: 2080, month: 1, day: 1 };
  
  const [year, setYear] = useState(bsDate.year.toString());
  const [day, setDay] = useState(bsDate.day.toString());
  const [monthModalVisible, setMonthModalVisible] = useState(false);

  // Sync state when date changes from outside (e.g. initial load)
  useEffect(() => {
    if (mode === 'BS') {
      const bs = adToBs(date);
      if (bs) {
        setYear(bs.year.toString());
        setDay(bs.day.toString());
      }
    } else {
      setYear(date.getFullYear().toString());
      setDay(date.getDate().toString());
    }
  }, [date, mode]);

  const updateDate = (newYear, newMonthIdx, newDay, currentMode) => {
    const y = parseInt(newYear);
    const d = parseInt(newDay);
    if (isNaN(y) || isNaN(d)) return;

    if (currentMode === 'BS') {
      const ad = bsToAd(y, newMonthIdx + 1, d);
      if (ad) onChange(ad);
    } else {
      const ad = new Date(y, newMonthIdx, d);
      if (!isNaN(ad.getTime())) onChange(ad);
    }
  };

  const currentMonthIdx = mode === 'BS' ? bsDate.month - 1 : date.getMonth();
  const months = mode === 'BS' ? nepaliMonths : englishMonths;

  return (
    <View style={styles.datePickerContainer}>
      <View style={styles.dateHeaderRow}>
        <Text style={styles.label}>{label} *</Text>
        <View style={styles.modeToggle}>
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'BS' && styles.modeBtnActive]}
            onPress={() => setMode('BS')}
          >
            <Text style={[styles.modeBtnText, mode === 'BS' && styles.modeBtnTextActive]}>BS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'AD' && styles.modeBtnActive]}
            onPress={() => setMode('AD')}
          >
            <Text style={[styles.modeBtnText, mode === 'AD' && styles.modeBtnTextActive]}>AD</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateInputsRow}>
        <View style={styles.yearInputWrap}>
          <Text style={styles.tinyLabel}>Year</Text>
          <TextInput
            style={styles.yearInput}
            value={year}
            keyboardType="numeric"
            maxLength={4}
            onChangeText={(text) => {
              setYear(text);
              if (text.length === 4) updateDate(text, currentMonthIdx, day, mode);
            }}
          />
        </View>

        <View style={styles.monthInputWrap}>
          <Text style={styles.tinyLabel}>Month</Text>
          <TouchableOpacity 
            style={styles.monthSelector}
            onPress={() => setMonthModalVisible(true)}
          >
            <Text style={styles.monthSelectorText}>{months[currentMonthIdx]}</Text>
            <Ionicons name="chevron-down" size={14} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.dayInputWrap}>
          <Text style={styles.tinyLabel}>Day</Text>
          <TextInput
            style={styles.dayInput}
            value={day}
            keyboardType="numeric"
            maxLength={2}
            onChangeText={(text) => {
              setDay(text);
              updateDate(year, currentMonthIdx, text, mode);
            }}
          />
        </View>

        <View style={styles.timeInputWrap}>
          <Text style={styles.tinyLabel}>Time</Text>
          <TextInput
            style={styles.timeInput}
            value={time}
            placeholder="10:00"
            onChangeText={onTimeChange}
          />
        </View>
      </View>

      <Modal visible={monthModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.monthModal}>
            <ScrollView>
              {months.map((m, idx) => (
                <TouchableOpacity 
                  key={m} 
                  style={styles.monthItem}
                  onPress={() => {
                    updateDate(year, idx, day, mode);
                    setMonthModalVisible(false);
                  }}
                >
                  <Text style={[styles.monthItemText, currentMonthIdx === idx && styles.monthItemTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function IPOListScreen({ apiUrl, onNavigate }) {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIPO, setEditingIPO] = useState(null);
  const [activeTab, setActiveTab] = useState('Open');
  const [types, setTypes] = useState(['IPO', 'FPO', 'Right Share', 'Debenture', 'Mutual Fund']);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    type: 'IPO',
    units: '',
    price: '',
    openingDate: new Date(),
    openingTime: '10:00',
    closingDate: new Date(),
    closingTime: '17:00',
  });

  useEffect(() => {
    fetchIPOs();
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/ipos/types`);
      const data = await response.json();
      if (data.success) {
        setTypes(data.data);
      }
    } catch (error) {
      console.warn('Failed to fetch types');
    }
  };

  const fetchIPOs = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/ipos`);
      const data = await response.json();
      if (data.success) {
        setIpos(data.data);
      }
      
      // Also fetch last sync time
      const settingsResp = await fetch(`${apiUrl}/admin/settings`);
      const settingsData = await settingsResp.json();
      if (settingsData.success && settingsData.data) {
        setLastSynced(settingsData.data.lastSyncAt);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch IPOs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${apiUrl}/admin/sync-ipos`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        const { added, updated } = data.stats;
        Alert.alert('Sync Complete', `Added: ${added}, Updated: ${updated}`);
        fetchIPOs();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Alert.alert('Sync Failed', error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAdd = () => {
    setEditingIPO(null);
    setFormData({
      company: '',
      type: types[0] || 'IPO',
      units: '',
      price: '',
      openingDate: new Date(),
      openingTime: '10:00',
      closingDate: new Date(),
      closingTime: '17:00',
    });
    setModalVisible(true);
  };

  const handleEdit = (ipo) => {
    setEditingIPO(ipo);
    
    const opDate = new Date(ipo.openingDate);
    const clDate = new Date(ipo.closingDate);

    setFormData({
      company: ipo.company,
      type: ipo.type,
      units: ipo.units.replace(/,/g, ''),
      price: ipo.price.replace('Rs. ', ''),
      openingDate: opDate,
      openingTime: `${opDate.getHours().toString().padStart(2, '0')}:${opDate.getMinutes().toString().padStart(2, '0')}`,
      closingDate: clDate,
      closingTime: `${clDate.getHours().toString().padStart(2, '0')}:${clDate.getMinutes().toString().padStart(2, '0')}`,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.company || !formData.units || !formData.price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Format data before saving
    const formattedUnits = Number(formData.units).toLocaleString('en-IN');
    const formattedPrice = formData.price.startsWith('Rs.') ? formData.price : `Rs. ${formData.price}`;

    // Combine Date and Time
    const combineDateTime = (date, timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    };

    const finalOpeningDate = combineDateTime(formData.openingDate, formData.openingTime);
    const finalClosingDate = combineDateTime(formData.closingDate, formData.closingTime);

    const dataToSave = {
      ...formData,
      units: formattedUnits,
      price: formattedPrice,
      openingDate: finalOpeningDate,
      closingDate: finalClosingDate,
    };

    try {
      const url = editingIPO
        ? `${apiUrl}/admin/ipos/${editingIPO._id}`
        : `${apiUrl}/admin/ipos`;
      
      const method = editingIPO ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', `IPO ${editingIPO ? 'updated' : 'added'} successfully`);
        setModalVisible(false);
        fetchIPOs();
      } else {
        Alert.alert('Error', data.error || 'Failed to save IPO');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save IPO');
    }
  };

  const handleDelete = (ipo) => {
    Alert.alert(
      'Delete IPO',
      `Are you sure you want to delete ${ipo.company}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${apiUrl}/admin/ipos/${ipo._id}`, {
                method: 'DELETE',
              });
              const data = await response.json();
              if (data.success) {
                Alert.alert('Success', 'IPO deleted successfully');
                fetchIPOs();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete IPO');
            }
          },
        },
      ]
    );
  };

  const renderIPO = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.company}>{item.company}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.type}>{item.type}</Text>
      <Text style={styles.detail}>Units: {item.units}</Text>
      <Text style={styles.detail}>Price: {item.price}</Text>
      <Text style={styles.detail}>Opening: {new Date(item.openingDate).toDateString()} {new Date(item.openingDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
      <Text style={styles.detail}>Closing: {new Date(item.closingDate).toDateString()} {new Date(item.closingDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Ionicons name="create-outline" size={20} color="white" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={20} color="white" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#4CAF50';
      case 'Upcoming': return '#2196F3';
      case 'Closed': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>IPO Management</Text>
            <Text style={styles.headerSubtitle}>
              {ipos.filter(i => i.status === activeTab).length} {activeTab} IPOs
              {lastSynced && ` • Synced: ${new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.syncButton} 
              onPress={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="sync-outline" size={24} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={() => onNavigate('Settings')}
            >
              <Ionicons name="settings-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['Open', 'Upcoming', 'Closed'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* IPO List */}
      <FlatList
        data={ipos.filter(i => i.status === activeTab)}
        renderItem={renderIPO}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchIPOs(); }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No IPOs yet</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingIPO ? 'Edit IPO' : 'Add New IPO'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
              placeholder="e.g., Nepal Infrastructure Bank"
            />

            <TypeSelector 
              types={types}
              selectedType={formData.type}
              onSelect={(type) => setFormData({ ...formData, type })}
              onNewType={(newType) => {
                if (!types.includes(newType)) {
                  setTypes([...types, newType]);
                }
                setFormData({ ...formData, type: newType });
              }}
            />

            <Text style={styles.label}>Units *</Text>
            <TextInput
              style={styles.input}
              value={formData.units}
              onChangeText={(text) => {
                // Remove non-numeric characters
                const numericValue = text.replace(/[^0-9]/g, '');
                setFormData({ ...formData, units: numericValue });
              }}
              placeholder="e.g., 15000000"
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>Enter number only (commas added automatically)</Text>

            <Text style={styles.label}>Price *</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.pricePrefix}>Rs.</Text>
              <TextInput
                style={styles.priceInput}
                value={formData.price}
                onChangeText={(text) => {
                  // Remove non-numeric characters
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  setFormData({ ...formData, price: numericValue });
                }}
                placeholder="100"
                keyboardType="numeric"
              />
            </View>

            <NepaliDatePicker 
              label="Opening Date"
              date={formData.openingDate}
              time={formData.openingTime}
              onChange={(date) => setFormData({ ...formData, openingDate: date })}
              onTimeChange={(time) => setFormData({ ...formData, openingTime: time })}
            />

            <NepaliDatePicker 
              label="Closing Date"
              date={formData.closingDate}
              time={formData.closingTime}
              onChange={(date) => setFormData({ ...formData, closingDate: date })}
              onTimeChange={(time) => setFormData({ ...formData, closingTime: time })}
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.typeButtons}>
              {['Open', 'Upcoming', 'Closed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.typeButton, formData.status === status && styles.typeButtonActive]}
                  onPress={() => setFormData({ ...formData, status })}
                >
                  <Text style={[styles.typeButtonText, formData.status === status && styles.typeButtonTextActive]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save IPO</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200EE',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  syncButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  settingsButton: {
    padding: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  company: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#6200EE',
  },
  type: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200EE',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: '#6200EE',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pricePrefix: {
    paddingLeft: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  priceInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  typeButtonActive: {
    backgroundColor: '#6200EE',
  },
  typeButtonText: {
    color: '#6200EE',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Selector & Modal Styles
  selectorContainer: {
    marginBottom: 16,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownTriggerText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModal: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '60%',
    padding: 16,
  },
  modalHeaderSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  modalTitleSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  typeItemText: {
    fontSize: 16,
    color: '#555',
  },
  typeItemActive: {
    backgroundColor: '#f0e6ff',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  typeItemTextActive: {
    color: '#6200EE',
    fontWeight: '600',
  },
  addTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  addTypeBtnText: {
    color: '#6200EE',
    fontWeight: '600',
  },
  addingContainer: {
    marginTop: 10,
  },
  saveSmallBtn: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  saveSmallBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Date Picker Styles
  datePickerContainer: {
    marginBottom: 20,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    padding: 2,
  },
  modeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 13,
  },
  modeBtnActive: {
    backgroundColor: 'white',
    elevation: 2,
  },
  modeBtnText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: '#6200EE',
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  yearInputWrap: { flex: 1.5 },
  monthInputWrap: { flex: 2.5 },
  dayInputWrap: { flex: 1.2 },
  timeInputWrap: { flex: 1.8 },
  tinyLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
    marginLeft: 2,
  },
  yearInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 15,
    textAlign: 'center',
  },
  dayInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 15,
    textAlign: 'center',
  },
  timeInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 15,
    textAlign: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
  },
  monthSelectorText: {
    fontSize: 14,
    color: '#333',
  },
  monthModal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '70%',
    padding: 10,
  },
  monthItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  monthItemText: {
    fontSize: 16,
    color: '#444',
  },
  monthItemTextActive: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
});
