"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BlockchainConnectUIProps {
  amount: number;
  onPaymentSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
}

export function BlockchainConnectUI({
  amount,
  onPaymentSubmit,
  isSubmitting,
}: BlockchainConnectUIProps) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate a fake wallet address for demo
    const fakeAddress = `0x${Array.from({ length: 40 }, () => 
      "0123456789ABCDEF"[Math.floor(Math.random() * 16)]
    ).join("")}`;
    
    setWalletAddress(fakeAddress);
    setIsWalletConnected(true);
    setIsConnecting(false);
  };

  const handleDisconnectWallet = () => {
    setWalletAddress("");
    setIsWalletConnected(false);
  };

  const handlePaymentSubmit = () => {
    onPaymentSubmit({ walletAddress });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertDescription>
          This is a demonstration of how blockchain payments could be integrated. 
          No actual cryptocurrency transactions will occur.
        </AlertDescription>
      </Alert>
      
      {!isWalletConnected ? (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M16 14V8a2 2 0 0 0-2-2H8" />
              <path d="M22 9V5a2 2 0 0 0-2-2H9" />
            </svg>
          </div>
          <p className="text-center mb-4">
            Connect your wallet to make a payment using cryptocurrency
          </p>
          <Button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border rounded-md">
            <Label className="text-sm text-muted-foreground">Connected Wallet</Label>
            <div className="flex items-center justify-between mt-1">
              <div className="font-mono text-sm truncate max-w-[80%]">
                {walletAddress}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnectWallet}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Disconnect
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Payment Amount:</span>
              <span className="font-medium">${amount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Equivalent in ETH:</span>
              <span className="font-medium">
                {(amount / 2500).toFixed(6)} ETH
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Network Fee (estimated):</span>
              <span className="font-medium">
                {(amount / 2500 * 0.02).toFixed(6)} ETH
              </span>
            </div>
            
            <div className="flex items-center justify-between font-medium">
              <span>Total:</span>
              <span>
                {(amount / 2500 * 1.02).toFixed(6)} ETH
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handlePaymentSubmit} 
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? "Processing Payment..." : "Confirm Payment"}
          </Button>
        </div>
      )}
    </div>
  );
} 