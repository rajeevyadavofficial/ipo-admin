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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function IPOListScreen({ apiUrl }) {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIPO, setEditingIPO] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    type: 'IPO',
    customType: '',
    units: '',
    price: '',
    openingDate: '',
    closingDate: '',
    status: 'Upcoming',
  });
  const [isCustomType, setIsCustomType] = useState(false);

  useEffect(() => {
    fetchIPOs();
  }, []);

  const fetchIPOs = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/ipos`);
      const data = await response.json();
      if (data.success) {
        setIpos(data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch IPOs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAdd = () => {
    setEditingIPO(null);
    setFormData({
      company: '',
      type: 'IPO',
      customType: '',
      units: '',
      price: '',
      openingDate: '',
      closingDate: '',
      status: 'Upcoming',
    });
    setIsCustomType(false);
    setModalVisible(true);
  };

  const handleEdit = (ipo) => {
    setEditingIPO(ipo);
    
    const isPredefined = ['IPO', 'FPO', 'Right Share', 'Debenture'].includes(ipo.type);
    
    setFormData({
      company: ipo.company,
      type: isPredefined ? ipo.type : 'Custom',
      customType: isPredefined ? '' : ipo.type,
      units: ipo.units.replace(/,/g, ''), // Remove commas for editing
      price: ipo.price.replace('Rs. ', ''), // Remove prefix for editing
      openingDate: ipo.openingDate,
      closingDate: ipo.closingDate,
      status: ipo.status,
    });
    setIsCustomType(!isPredefined);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.company || !formData.units || !formData.price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Format data before saving
    const finalType = isCustomType ? formData.customType : formData.type;
    if (isCustomType && !finalType) {
      Alert.alert('Error', 'Please enter a custom type');
      return;
    }

    // Format units with commas
    const formattedUnits = Number(formData.units).toLocaleString('en-IN');
    
    // Format price with Rs. prefix if not present
    const formattedPrice = formData.price.startsWith('Rs.') 
      ? formData.price 
      : `Rs. ${formData.price}`;

    const dataToSave = {
      ...formData,
      type: finalType,
      units: formattedUnits,
      price: formattedPrice,
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
      <Text style={styles.detail}>Opening: {item.openingDate}</Text>
      <Text style={styles.detail}>Closing: {item.closingDate}</Text>

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
        <Text style={styles.headerTitle}>IPO Management</Text>
        <Text style={styles.headerSubtitle}>{ipos.length} IPOs</Text>
      </View>

      {/* IPO List */}
      <FlatList
        data={ipos}
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
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingIPO ? 'Edit IPO' : 'Add New IPO'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
              placeholder="e.g., Nepal Infrastructure Bank"
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeButtons}>
              {['IPO', 'FPO', 'Right Share', 'Debenture', 'Custom'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton, 
                    (type === 'Custom' ? isCustomType : formData.type === type && !isCustomType) && styles.typeButtonActive
                  ]}
                  onPress={() => {
                    if (type === 'Custom') {
                      setIsCustomType(true);
                    } else {
                      setIsCustomType(false);
                      setFormData({ ...formData, type });
                    }
                  }}
                >
                  <Text style={[
                    styles.typeButtonText, 
                    (type === 'Custom' ? isCustomType : formData.type === type && !isCustomType) && styles.typeButtonTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {isCustomType && (
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={formData.customType}
                onChangeText={(text) => setFormData({ ...formData, customType: text })}
                placeholder="Enter custom type (e.g., Mutual Fund)"
              />
            )}

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

            <Text style={styles.label}>Opening Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.openingDate}
              onChangeText={(text) => setFormData({ ...formData, openingDate: text })}
              placeholder="e.g., 2024-12-15"
            />

            <Text style={styles.label}>Closing Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.closingDate}
              onChangeText={(text) => setFormData({ ...formData, closingDate: text })}
              placeholder="e.g., 2024-12-20"
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
    bottom: 20,
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
});
