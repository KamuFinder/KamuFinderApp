import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Keyboard,
} from "react-native";

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = "Paikkakunta",
  style,
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const justSelectedRef= useRef(false);

  const API_KEY = process.env.EXPO_PUBLIC_DIGITRANSIT_API_KEY;

  useEffect(() => {
    if (!hasUserTyped) return;

    if (typeof value !== "string" || value.trim().length < 2) {
      setResults([]);
      return;
    }

    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      fetchCities(value.trim());
    }, 350); // debounce

    return () => clearTimeout(timeout);
  }, [value]);

  const fetchCities = async (query) => {
    try {

      const cleanQuery = query.trim();

      if (cleanQuery.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);

      const url =
        `https://api.digitransit.fi/geocoding/v1/autocomplete` +
        `?text=${encodeURIComponent(query)}` +
        `&lang=fi` +
        `&layers=localadmin`;

      const res = await fetch(url, {
        headers: {
          "digitransit-subscription-key": API_KEY,
      },
      });

      const text = await res.text();
     

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = JSON.parse(text);

      const seen = new Set();
      const cities = [];

      for (const item of data.features || []) {
        const props = item.properties || {};

        const layer = props.layer;
        const name=(props.name || props.label || "").split(",")[0].trim();
        
        if (layer !== "localadmin" || !name) continue;

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
    justSelectedRef.current = true;
    onChange(city);
    setResults([]);
    Keyboard.dismiss();
  };

  return (
    <View style={{ width: "100%", position: "relative", zIndex: 999 }}>
      <TextInput
        style={style}
        value={typeof value === "string" ? value : ""}
        onChangeText={(text) => {
          setHasUserTyped(true);
          justSelectedRef.current = false;
          onChange(text);
        }}
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
            marginTop: 4,
            elevation: 5,
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