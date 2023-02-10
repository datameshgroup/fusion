---
sidebar_position: 1
---

# Introduction

The DataMesh Fusion API enables a POS (the *Sale System*) to take payments using a DataMesh Satellite terminal (the *POI terminal*). 

The API is organised around websockets and a JSON message interface which is based on and guided by the open, industry standard Nexo Retailer Sale to POI Protocol V3.1. It is highly recommended that this document is read alongside the official [NEXO Standard documentation](https://www.nexo-standards.org/).

Both POI Terminal and Sale System connect to Unify (the POI System) - a high-performance, resilient, financial switching platform created by DataMesh.

Unify orchestrates the message flow between Sale System and terminal, and assists with error recovery and reconciliation. 

![](/img/overview-diagram.png)

