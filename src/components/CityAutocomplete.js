import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = "Paikkakunta",
  style,
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetchCities(value.trim());
    }, 350); // debounce

    return () => clearTimeout(timeout);
  }, [value]);

  const fetchCities = async (query) => {
    try {
      setLoading(true);

      const url =
        `https://api.digitransit.fi/geocoding/v1/autocomplete` +
        `?text=${encodeURIComponent(query)}` +
        `&lang=fi` +
        `&layers=localadmin,region` +
        `&sources=nlsfi,osm`;

      const res = await fetch(url);
      const data = await res.json();

      const seen = new Set();
      const cities = [];

      for (const item of data.features || []) {
        let name =
          item.properties?.label || item.properties?.name || "";

        // Otetaan vain kaupungin nimi (ennen pilkkua)
        name = name.split(",")[0].trim();

        if (name && !seen.has(name)) {
          seen.add(name);
          cities.push({
            id: item.properties?.id || name,
            name,
          });
        }
      }

      setResults(cities.slice(0, 6));
    } catch (e) {
      console.log("City fetch error:", e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (city) => {
    onChange(city);
    setResults([]);
  };

  return (
    <View style={{ width: "100%", position: "relative", zIndex: 999 }}>
      <TextInput
        style={style}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
      />

      {loading && (
        <Text style={{ marginTop: 4 }}>Haetaan...</Text>
      )}

      {results.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: 50,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            maxHeight: 200,
            zIndex: 1000,
          }}
        >
          {results.map((item) => (
            <TouchableOpacity
              key={item.id.toString()}

                onPress={() => handleSelect(item.name)}
                activeOpacity={0.7}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#eee",
                }}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </View>
  );
}